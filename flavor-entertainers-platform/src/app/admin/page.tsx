'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserCheck,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import type { Database } from '@/lib/types/database';

interface DashboardStats {
  totalUsers: number;
  totalPerformers: number;
  totalBookings: number;
  totalRevenue: number;
  pendingApplications: number;
  activeBookings: number;
  recentGrowth: {
    users: number;
    bookings: number;
    revenue: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'application' | 'payment' | 'user';
  title: string;
  description: string;
  time: string;
  status: 'success' | 'warning' | 'info' | 'error';
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const supabase = createClientComponentClient<Database>();

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch dashboard statistics
      const [
        usersCount,
        performersCount,
        bookingsCount,
        paymentsSum,
        pendingAppsCount,
        activeBookingsCount
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('performers').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('amount').eq('status', 'completed'),
        supabase.from('vetting_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).in('status', ['pending', 'confirmed'])
      ]);

      const totalRevenue = paymentsSum.data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

      // Calculate growth (mock data for demo)
      const dashboardStats: DashboardStats = {
        totalUsers: usersCount.count || 0,
        totalPerformers: performersCount.count || 0,
        totalBookings: bookingsCount.count || 0,
        totalRevenue,
        pendingApplications: pendingAppsCount.count || 0,
        activeBookings: activeBookingsCount.count || 0,
        recentGrowth: {
          users: 12.5,
          bookings: 8.3,
          revenue: 15.7
        }
      };

      setStats(dashboardStats);

      // Fetch recent activity
      const activities: RecentActivity[] = [
        {
          id: '1',
          type: 'booking',
          title: 'New Booking Created',
          description: 'Corporate event booking for next weekend',
          time: '5 minutes ago',
          status: 'info'
        },
        {
          id: '2',
          type: 'application',
          title: 'Performer Application Submitted',
          description: 'New performer application awaiting review',
          time: '12 minutes ago',
          status: 'warning'
        },
        {
          id: '3',
          type: 'payment',
          title: 'Payment Processed',
          description: 'PayID payment of $450 completed successfully',
          time: '18 minutes ago',
          status: 'success'
        },
        {
          id: '4',
          type: 'user',
          title: 'New User Registration',
          description: 'Client registered and verified email',
          time: '25 minutes ago',
          status: 'success'
        }
      ];

      setRecentActivity(activities);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Set up real-time subscriptions for key metrics
    const bookingsChannel = supabase
      .channel('dashboard-bookings')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => fetchDashboardData()
      )
      .subscribe();

    const paymentsChannel = supabase
      .channel('dashboard-payments')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => fetchDashboardData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(paymentsChannel);
    };
  }, [supabase]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return Calendar;
      case 'application': return UserCheck;
      case 'payment': return DollarSign;
      case 'user': return Users;
      default: return CheckCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-blue-400';
    }
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
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Welcome to the Flavor Entertainers admin panel
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
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
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
            <div className="flex items-center text-xs text-green-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{stats?.recentGrowth.users}% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Performers</CardTitle>
            <UserCheck className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalPerformers || 0}</div>
            <div className="text-xs text-gray-400">
              {stats?.pendingApplications || 0} pending applications
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalBookings || 0}</div>
            <div className="flex items-center text-xs text-green-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{stats?.recentGrowth.bookings}% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${stats?.totalRevenue.toLocaleString() || '0'}
            </div>
            <div className="flex items-center text-xs text-green-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{stats?.recentGrowth.revenue}% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-yellow-900/20 border-yellow-700/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-300">Pending Applications</CardTitle>
            <Shield className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{stats?.pendingApplications || 0}</div>
            <p className="text-xs text-yellow-300/70">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-900/20 border-blue-700/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-300">Active Bookings</CardTitle>
            <Clock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{stats?.activeBookings || 0}</div>
            <p className="text-xs text-blue-300/70">Ongoing events</p>
          </CardContent>
        </Card>

        <Card className="bg-green-900/20 border-green-700/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-300">System Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">Online</div>
            <p className="text-xs text-green-300/70">All services operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
          <CardDescription className="text-gray-400">
            Latest platform events and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg bg-gray-800/30">
                  <div className={`mt-0.5 ${getStatusColor(activity.status)}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{activity.title}</p>
                    <p className="text-sm text-gray-400">{activity.description}</p>
                  </div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}