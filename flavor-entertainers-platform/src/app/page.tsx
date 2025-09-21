import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Users, Shield, Clock, Star, Music, Heart, Sparkles } from 'lucide-react'
import { LivePerformersGrid } from '@/components/performers/live-performers-grid'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen dark-gradient-bg">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 brand-gradient rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold brand-gradient-text">Flavor Entertainers</span>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/services" className="text-gray-300 hover:text-white transition-colors">
              Services
            </Link>
            <Link href="/performers" className="text-gray-300 hover:text-white transition-colors">
              Performers
            </Link>
            <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#about" className="text-gray-300 hover:text-white transition-colors">
              About
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button className="brand-gradient hover:opacity-90">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 dark-hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              Book <span className="brand-gradient-text">Vetted Performers</span><br />
              For Your Next Event
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Australia's premier platform connecting event organizers with professional,
              background-checked entertainers. From musicians to magicians, we've got your event covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="text-lg px-8 brand-gradient hover:opacity-90 transition-opacity">
                  Find Performers
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="text-lg px-8 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
                  Become a Performer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 dark-gradient-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Why Choose Flavor Entertainers?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              We take the stress out of booking entertainment with our comprehensive vetting process and seamless platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-hover bg-gray-800/50 border-gray-700 backdrop-blur">
              <CardHeader className="text-center">
                <div className="w-12 h-12 brand-gradient rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Vetted Professionals</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-300">
                  All performers undergo thorough background checks, document verification, and skill assessments
                  before joining our platform.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover bg-gray-800/50 border-gray-700 backdrop-blur">
              <CardHeader className="text-center">
                <div className="w-12 h-12 brand-gradient rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Instant Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-300">
                  Browse available performers, check their calendars, and book instantly with our
                  real-time availability system.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover bg-gray-800/50 border-gray-700 backdrop-blur">
              <CardHeader className="text-center">
                <div className="w-12 h-12 brand-gradient rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">PayID Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-300">
                  Secure, instant payments with Australia's PayID system. No more waiting for bank transfers
                  or cash handling.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Performer Types Section */}
      <section id="performers" className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Find the Perfect Performer</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              From intimate gatherings to large corporate events, we have entertainers for every occasion.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Music, name: 'Musicians', count: '150+' },
              { icon: Heart, name: 'Dancers', count: '80+' },
              { icon: Sparkles, name: 'Magicians', count: '45+' },
              { icon: Users, name: 'Comedians', count: '60+' },
            ].map((type, index) => (
              <Card key={index} className="text-center card-hover bg-gray-800/50 border-gray-700 backdrop-blur">
                <CardContent className="pt-6">
                  <type.icon className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                  <h3 className="font-semibold mb-2 text-white">{type.name}</h3>
                  <p className="text-sm text-gray-300">{type.count} verified performers</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Live Performers Section */}
      <section className="py-20 dark-gradient-surface">
        <div className="container mx-auto px-4">
          <LivePerformersGrid />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold brand-gradient-text mb-2">500+</div>
              <div className="text-muted-foreground">Verified Performers</div>
            </div>
            <div>
              <div className="text-4xl font-bold brand-gradient-text mb-2">2,000+</div>
              <div className="text-muted-foreground">Successful Events</div>
            </div>
            <div>
              <div className="text-4xl font-bold brand-gradient-text mb-2">4.9★</div>
              <div className="text-muted-foreground">Average Rating</div>
            </div>
            <div>
              <div className="text-4xl font-bold brand-gradient-text mb-2">24h</div>
              <div className="text-muted-foreground">Average Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 brand-gradient">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Make Your Event Unforgettable?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied clients who trust Flavor Entertainers for their events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Book Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/performers">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent border-white text-white hover:bg-white hover:text-primary">
                Browse Performers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 brand-gradient rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Flavor Entertainers</span>
              </div>
              <p className="text-gray-400 mb-4">
                Australia's premier platform for booking vetted professional performers.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Clients</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/how-it-works" className="hover:text-white">How it Works</Link></li>
                <li><Link href="/performers" className="hover:text-white">Browse Performers</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Performers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/vetting/apply" className="hover:text-white">Apply Now</Link></li>
                <li><Link href="/performer-benefits" className="hover:text-white">Benefits</Link></li>
                <li><Link href="/resources" className="hover:text-white">Resources</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Flavor Entertainers. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
