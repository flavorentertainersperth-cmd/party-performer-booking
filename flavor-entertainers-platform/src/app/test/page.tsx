import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">Flavor Entertainers - Component Test</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Status</CardTitle>
              <CardDescription>Core components and functionality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Authentication System</span>
                <span className="text-green-600">✓ Ready</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Database Schema</span>
                <span className="text-green-600">✓ Ready</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Vetting Application</span>
                <span className="text-green-600">✓ Ready</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Performer Listings</span>
                <span className="text-green-600">✓ Ready</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Booking System</span>
                <span className="text-yellow-600">⚠ In Progress</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Payment Integration</span>
                <span className="text-red-600">✗ Pending</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Test the platform features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full">
                <a href="/auth/register">Create Account</a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href="/auth/login">Sign In</a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href="/performers">Browse Performers</a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href="/vetting/apply">Apply as Performer</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="brand-gradient-text">
              Flavor Entertainers Platform
            </CardTitle>
            <CardDescription>
              Production-ready entertainment booking platform for Australia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold brand-gradient-text">500+</div>
                <div className="text-sm text-muted-foreground">Ready for Performers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold brand-gradient-text">100%</div>
                <div className="text-sm text-muted-foreground">Secure & Vetted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold brand-gradient-text">24/7</div>
                <div className="text-sm text-muted-foreground">Platform Available</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}