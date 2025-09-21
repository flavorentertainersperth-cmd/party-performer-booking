'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PerformerSidebar } from '@/components/performer/performer-sidebar';
import { PerformerHeader } from '@/components/performer/performer-header';
import type { Database } from '@/lib/types/database';

export default function PerformerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [performer, setPerformer] = useState<any>(null);
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push('/auth/login');
          return;
        }

        // Check if user has performer role
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error || userData?.role !== 'performer') {
          router.push('/');
          return;
        }

        // Get performer profile
        const { data: performerData } = await supabase
          .from('performers')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        setUser(session.user);
        setPerformer(performerData);
      } catch (error) {
        console.error('Error checking user:', error);
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [router, supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen dark-gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user || !performer) {
    return (
      <div className="min-h-screen dark-gradient-bg flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Performer Profile Required</h2>
          <p className="text-gray-400 mb-6">
            You need to complete your performer application first.
          </p>
          <button
            onClick={() => router.push('/vetting/apply')}
            className="brand-gradient px-6 py-3 rounded-lg font-medium"
          >
            Apply to Become a Performer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark-gradient-bg">
      <div className="flex">
        <PerformerSidebar performer={performer} />
        <div className="flex-1">
          <PerformerHeader user={user} performer={performer} />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}