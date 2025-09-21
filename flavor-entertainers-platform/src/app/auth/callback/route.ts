import { createServerComponentClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerComponentClient()

    await supabase.auth.exchangeCodeForSession(code)

    // Get user to determine redirect
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      // If no profile exists, create one from auth metadata
      if (!profile && user.user_metadata) {
        await supabase.from('users').insert({
          id: user.id,
          email: user.email!,
          first_name: user.user_metadata.first_name,
          last_name: user.user_metadata.last_name,
          phone: user.user_metadata.phone,
          role: user.user_metadata.role || 'client',
          profile_picture_url: user.user_metadata.avatar_url,
        })

        // Redirect based on role from metadata
        const role = user.user_metadata.role || 'client'
        switch (role) {
          case 'admin':
            return NextResponse.redirect(new URL('/admin', request.url))
          case 'performer':
            return NextResponse.redirect(new URL('/vetting/apply', request.url))
          case 'client':
            return NextResponse.redirect(new URL('/dashboard/client', request.url))
          default:
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }

      // Redirect based on existing profile role
      switch (profile?.role) {
        case 'admin':
          return NextResponse.redirect(new URL('/admin', request.url))
        case 'performer':
          return NextResponse.redirect(new URL('/dashboard/performer', request.url))
        case 'client':
          return NextResponse.redirect(new URL('/dashboard/client', request.url))
        default:
          return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
}