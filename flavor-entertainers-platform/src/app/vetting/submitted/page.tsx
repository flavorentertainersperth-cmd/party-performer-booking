import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Clock, Shield, Mail, Phone } from 'lucide-react'
import Link from 'next/link'

export default function VettingSubmittedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Application Submitted!</h1>
          <p className="text-xl text-muted-foreground">
            Thank you for applying to join Flavor Entertainers. We've received your application and will review it shortly.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
            <CardDescription>
              Here's what you can expect during our vetting process:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Initial Review (1-2 business days)</h3>
                  <p className="text-muted-foreground text-sm">
                    Our team will review your application, portfolio, and documents for completeness and initial suitability.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Document Verification (2-3 business days)</h3>
                  <p className="text-muted-foreground text-sm">
                    We'll verify your ID, insurance, and other documents. We may contact you if additional information is needed.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Reference Check (2-3 business days)</h3>
                  <p className="text-muted-foreground text-sm">
                    We'll contact your professional references to verify your experience and reliability.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">4</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Background Check (3-5 business days)</h3>
                  <p className="text-muted-foreground text-sm">
                    Final background verification and compliance checks will be completed.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Approval & Onboarding</h3>
                  <p className="text-muted-foreground text-sm">
                    Upon approval, you'll receive access to your performer dashboard and can start accepting bookings!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Expected Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-semibold text-2xl brand-gradient-text">3-5 Business Days</p>
                <p className="text-sm text-muted-foreground">
                  Most applications are processed within this timeframe. Complex cases may take longer.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Application Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="font-semibold">Under Review</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You'll receive email updates as your application progresses through each stage.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              Our support team is here to assist you throughout the vetting process.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <a href="mailto:vetting@flavor-entertainers.com.au" className="text-primary hover:underline">
                    vetting@flavor-entertainers.com.au
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <a href="tel:+61280000000" className="text-primary hover:underline">
                    +61 2 8000 0000
                  </a>
                  <p className="text-xs text-muted-foreground">Mon-Fri 9AM-5PM AEST</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <Link href="/auth/login">
            <Button size="lg">
              Sign In to Check Status
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            You can track your application progress in your account dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}