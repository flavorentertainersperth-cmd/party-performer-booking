import { VettingApplicationForm } from '@/components/vetting/application-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Clock, Star, CheckCircle } from 'lucide-react'

export default function VettingApplicationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Join <span className="brand-gradient-text">Flavor Entertainers</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Complete our comprehensive vetting process to become a verified performer on Australia's premier entertainment platform.
          </p>
        </div>

        {/* Process Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <div className="w-12 h-12 brand-gradient rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">1</span>
            </div>
            <h3 className="font-semibold mb-2">Application</h3>
            <p className="text-sm text-muted-foreground">Complete your performer profile and upload required documents</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 brand-gradient rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">2</span>
            </div>
            <h3 className="font-semibold mb-2">Review</h3>
            <p className="text-sm text-muted-foreground">Our team reviews your application and verifies documents</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 brand-gradient rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">3</span>
            </div>
            <h3 className="font-semibold mb-2">Background Check</h3>
            <p className="text-sm text-muted-foreground">Comprehensive background and reference verification</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 brand-gradient rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">4</span>
            </div>
            <h3 className="font-semibold mb-2">Approval</h3>
            <p className="text-sm text-muted-foreground">Welcome to the platform and start receiving bookings</p>
          </div>
        </div>

        {/* Requirements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Application Requirements
            </CardTitle>
            <CardDescription>
              Please ensure you have the following before starting your application:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Valid government-issued ID</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Professional photos/portfolio</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Performance videos (recommended)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Professional references</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Insurance certificate (if applicable)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">ABN (for business performers)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Working with Children Check (event dependent)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Equipment list and technical requirements</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>Performer Application</CardTitle>
            <CardDescription>
              Fill out all sections completely and accurately. Applications typically take 3-5 business days to process.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VettingApplicationForm />
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-primary" />
              <CardTitle className="text-lg">Premium Exposure</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription>
                Get featured on our platform and reach thousands of potential clients across Australia.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
              <CardTitle className="text-lg">Instant Payments</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription>
                Receive payments instantly via PayID. No more waiting for checks or bank transfers.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
              <CardTitle className="text-lg">Protected Bookings</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription>
                All bookings are protected with contracts and dispute resolution support.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}