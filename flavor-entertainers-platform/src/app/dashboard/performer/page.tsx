'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  DollarSign,
  Star,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Eye,
  Shield,
  MapPin
} from 'lucide-react';
import type { Database } from '@/lib/types/database';

interface DashboardStats {
  totalBookings: number;
  upcomingBookings: number;
  monthlyEarnings: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
  profileViews: number;
  responseRate: number;
}

interface RecentBooking {
  id: string;
  booking_reference: string;
  event_type: string;
  event_date: string;
  status: string;
  total_amount: number;
  client_name: string;
}

interface SafetyAlert {
  id: string;
  title: string;
  message: string;
  severity_level: number;
  created_at: string;
}

export default function PerformerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [performer, setPerformer] = useState<any>(null);
  const supabase = createClientComponentClient<Database>();

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Get current user and performer profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: performerData } = await supabase
        .from('performers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setPerformer(performerData);

      if (!performerData) return;

      // Get dashboard statistics
      const [
        bookingsCount,
        upcomingBookingsCount,
        paymentsSum,
        reviewsData
      ] = await Promise.all([
        supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('performer_id', performerData.id),
        supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('performer_id', performerData.id)
          .in('status', ['pending', 'confirmed'])
          .gte('event_date', new Date().toISOString()),
        supabase
          .from('payments')
          .select('amount')
          .eq('status', 'completed')
          .in('booking_id',
            (await supabase
              .from('bookings')
              .select('id')
              .eq('performer_id', performerData.id)
            ).data?.map(b => b.id) || []
          ),
        supabase
          .from('reviews')
          .select('rating')
          .eq('performer_id', performerData.id)
      ]);

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyEarnings = paymentsSum.data?.reduce((sum, payment) => {
        const paymentDate = new Date(payment.created_at);
        if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
          return sum + (payment.amount || 0);
        }
        return sum;
      }, 0) || 0;

      const totalEarnings = paymentsSum.data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
      const averageRating = reviewsData.data?.reduce((sum, review) => sum + review.rating, 0) / (reviewsData.data?.length || 1) || 0;

      const dashboardStats: DashboardStats = {
        totalBookings: bookingsCount.count || 0,
        upcomingBookings: upcomingBookingsCount.count || 0,
        monthlyEarnings,
        totalEarnings,
        averageRating,
        totalReviews: reviewsData.data?.length || 0,
        profileViews: Math.floor(Math.random() * 500) + 100, // Mock data
        responseRate: 95 // Mock data
      };

      setStats(dashboardStats);

      // Get recent bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_reference,
          event_type,
          event_date,
          status,
          total_amount,
          client:users!bookings_client_id_fkey(first_name, last_name)
        `)
        .eq('performer_id', performerData.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const formattedBookings = (bookingsData || []).map(booking => ({
        id: booking.id,
        booking_reference: booking.booking_reference,
        event_type: booking.event_type,
        event_date: booking.event_date,
        status: booking.status || 'pending',
        total_amount: booking.total_amount,
        client_name: booking.client?.first_name && booking.client?.last_name
          ? `${booking.client.first_name} ${booking.client.last_name}`
          : 'Anonymous Client'
      }));

      setRecentBookings(formattedBookings);

      // Get safety alerts
      const { data: alertsData } = await supabase
        .from('safety_alerts')
        .select('*')
        .eq('is_active', true)
        .contains('target_audience', ['performers'])
        .order('severity_level', { ascending: false })
        .limit(3);

      setSafetyAlerts(alertsData || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50';
      case 'confirmed': return 'bg-blue-900/30 text-blue-300 border-blue-700/50';
      case 'completed': return 'bg-green-900/30 text-green-300 border-green-700/50';
      case 'cancelled': return 'bg-red-900/30 text-red-300 border-red-700/50';
      default: return 'bg-gray-900/30 text-gray-300 border-gray-700/50';
    }
  };

  const getSeverityColor = (level: number) => {
    if (level >= 4) return 'text-red-400';
    if (level >= 3) return 'text-yellow-400';
    return 'text-blue-400';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, <span className="brand-gradient-text">{performer?.stage_name}</span>
          </h1>
          <p className="text-gray-400 mt-1">
            Here's what's happening with your performance career
          </p>
        </div>
        <Button
          onClick={fetchDashboardData}
          variant="outline"
          size="sm"
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalBookings || 0}</div>
            <div className="text-xs text-gray-400">
              {stats?.upcomingBookings || 0} upcoming
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Monthly Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(stats?.monthlyEarnings || 0)}
            </div>
            <div className="text-xs text-green-400">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Total: {formatCurrency(stats?.totalEarnings || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats?.averageRating?.toFixed(1) || '0.0'}
            </div>
            <div className="text-xs text-gray-400">
              {stats?.totalReviews || 0} reviews
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Profile Views</CardTitle>
            <Eye className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.profileViews || 0}</div>
            <div className="text-xs text-gray-400">
              {stats?.responseRate || 0}% response rate
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Safety Alerts */}
      {safetyAlerts.length > 0 && (
        <Card className="bg-red-900/20 border-red-700/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Safety Alerts
            </CardTitle>
            <CardDescription className="text-red-300/70">
              Important safety information for performers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {safetyAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 bg-red-900/20 rounded-lg border border-red-700/30">
                  <div className={`mt-0.5 ${getSeverityColor(alert.severity_level)}`}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-200">{alert.title}</h4>
                    <p className="text-sm text-red-300/80 mt-1">{alert.message}</p>
                    <div className="text-xs text-red-400 mt-2">
                      {formatDate(alert.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button
                onClick={() => window.location.href = '/dashboard/performer/safety'}
                variant="outline"
                size="sm"
                className="border-red-600 text-red-400 hover:bg-red-900/20"
              >
                <Shield className="w-4 h-4 mr-2" />
                View Safety Center
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Recent Bookings</CardTitle>
            <CardDescription className="text-gray-400">
              Your latest booking activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-white">{booking.booking_reference}</h4>
                        <Badge className={getStatusBadgeColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">{booking.event_type}</p>
                      <p className="text-xs text-gray-500">{booking.client_name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">
                        {formatCurrency(booking.total_amount)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDate(booking.event_date)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No bookings yet</p>
                  <p className="text-sm text-gray-500">Your bookings will appear here</p>
                </div>
              )}
            </div>
            <div className="mt-4">
              <Button
                onClick={() => window.location.href = '/dashboard/performer/bookings'}
                variant="outline"
                size="sm"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                View All Bookings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-gray-400">
              Frequently used features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => window.location.href = '/dashboard/performer/availability'}
                className="h-20 flex flex-col items-center justify-center bg-blue-900/20 border border-blue-700/50 text-blue-300 hover:bg-blue-900/30"
              >
                <Clock className="w-6 h-6 mb-2" />
                <span className="text-sm">Set Availability</span>
              </Button>

              <Button
                onClick={() => window.location.href = '/dashboard/performer/profile'}
                className="h-20 flex flex-col items-center justify-center bg-purple-900/20 border border-purple-700/50 text-purple-300 hover:bg-purple-900/30"
              >
                <Users className="w-6 h-6 mb-2" />
                <span className="text-sm">Edit Profile</span>
              </Button>

              <Button
                onClick={() => window.location.href = '/dashboard/performer/earnings'}
                className="h-20 flex flex-col items-center justify-center bg-green-900/20 border border-green-700/50 text-green-300 hover:bg-green-900/30"
              >
                <DollarSign className="w-6 h-6 mb-2" />
                <span className="text-sm">View Earnings</span>
              </Button>

              <Button
                onClick={() => window.location.href = '/dashboard/performer/safety'}
                className="h-20 flex flex-col items-center justify-center bg-red-900/20 border border-red-700/50 text-red-300 hover:bg-red-900/30"
              >
                <Shield className="w-6 h-6 mb-2" />
                <span className="text-sm">Safety Center</span>
              </Button>
            </div>

            {/* Safety Check-in */}
            <div className="mt-6 p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-green-300">Safety Check-in</h4>
                  <p className="text-xs text-green-400/70">Let us know you're safe</p>
                </div>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Check In
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}