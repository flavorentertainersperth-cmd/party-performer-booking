'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import type { Database } from '@/lib/types/database';

interface AnalyticsData {
  revenueData: Array<{ month: string; revenue: number; bookings: number }>;
  userGrowthData: Array<{ month: string; users: number; performers: number }>;
  servicePopularity: Array<{ name: string; value: number; fill: string }>;
  bookingStatusData: Array<{ status: string; count: number; fill: string }>;
  performerRatings: Array<{ rating: string; count: number }>;
}

const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const supabase = createClientComponentClient<Database>();

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);

      // Mock data for demonstration - in production, this would fetch real data
      const mockAnalyticsData: AnalyticsData = {
        revenueData: [
          { month: 'Jan', revenue: 15420, bookings: 28 },
          { month: 'Feb', revenue: 18230, bookings: 34 },
          { month: 'Mar', revenue: 22150, bookings: 42 },
          { month: 'Apr', revenue: 19890, bookings: 38 },
          { month: 'May', revenue: 25640, bookings: 48 },
          { month: 'Jun', revenue: 28750, bookings: 52 },
          { month: 'Jul', revenue: 31200, bookings: 56 },
          { month: 'Aug', revenue: 29480, bookings: 54 },
          { month: 'Sep', revenue: 33760, bookings: 61 },
          { month: 'Oct', revenue: 36920, bookings: 67 },
          { month: 'Nov', revenue: 39150, bookings: 72 },
          { month: 'Dec', revenue: 42300, bookings: 78 }
        ],
        userGrowthData: [
          { month: 'Jan', users: 45, performers: 12 },
          { month: 'Feb', users: 52, performers: 15 },
          { month: 'Mar', users: 68, performers: 18 },
          { month: 'Apr', users: 75, performers: 22 },
          { month: 'May', users: 89, performers: 28 },
          { month: 'Jun', users: 105, performers: 32 },
          { month: 'Jul', users: 124, performers: 38 },
          { month: 'Aug', users: 142, performers: 45 },
          { month: 'Sep', users: 168, performers: 52 },
          { month: 'Oct', users: 195, performers: 58 },
          { month: 'Nov', users: 224, performers: 65 },
          { month: 'Dec', users: 256, performers: 72 }
        ],
        servicePopularity: [
          { name: 'Waitressing', value: 35, fill: COLORS[0] },
          { name: 'Strip Shows', value: 28, fill: COLORS[1] },
          { name: 'Lap Dance', value: 22, fill: COLORS[2] },
          { name: 'Premium Events', value: 15, fill: COLORS[3] }
        ],
        bookingStatusData: [
          { status: 'Completed', count: 156, fill: COLORS[3] },
          { status: 'Confirmed', count: 42, fill: COLORS[2] },
          { status: 'Pending', count: 18, fill: COLORS[4] },
          { status: 'Cancelled', count: 8, fill: COLORS[5] }
        ],
        performerRatings: [
          { rating: '5 Stars', count: 89 },
          { rating: '4 Stars', count: 156 },
          { rating: '3 Stars', count: 34 },
          { rating: '2 Stars', count: 12 },
          { rating: '1 Star', count: 4 }
        ]
      };

      setAnalyticsData(mockAnalyticsData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(value);
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
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 mt-1">
            Comprehensive platform insights and metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={fetchAnalyticsData}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(analyticsData?.revenueData[analyticsData.revenueData.length - 1]?.revenue || 0)}
            </div>
            <div className="flex items-center text-xs text-green-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analyticsData?.userGrowthData[analyticsData.userGrowthData.length - 1]?.users || 0}
            </div>
            <div className="flex items-center text-xs text-blue-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.3% growth
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Monthly Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analyticsData?.revenueData[analyticsData.revenueData.length - 1]?.bookings || 0}
            </div>
            <div className="flex items-center text-xs text-purple-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15.7% increase
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Avg. Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">4.8</div>
            <div className="flex items-center text-xs text-yellow-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              +0.2 improvement
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="bg-gray-800/50 border-gray-700">
          <TabsTrigger value="revenue" className="data-[state=active]:bg-purple-600">Revenue</TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-purple-600">Users</TabsTrigger>
          <TabsTrigger value="services" className="data-[state=active]:bg-purple-600">Services</TabsTrigger>
          <TabsTrigger value="bookings" className="data-[state=active]:bg-purple-600">Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Revenue Trend</CardTitle>
                <CardDescription className="text-gray-400">
                  Monthly revenue and booking volume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData?.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                      formatter={(value, name) => [
                        name === 'revenue' ? formatCurrency(value as number) : value,
                        name === 'revenue' ? 'Revenue' : 'Bookings'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8b5cf6"
                      fill="url(#colorRevenue)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Booking Volume</CardTitle>
                <CardDescription className="text-gray-400">
                  Monthly booking counts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData?.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="bookings" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">User Growth</CardTitle>
              <CardDescription className="text-gray-400">
                Users and performers growth over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData?.userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    name="Total Users"
                  />
                  <Line
                    type="monotone"
                    dataKey="performers"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Performers"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Service Popularity</CardTitle>
                <CardDescription className="text-gray-400">
                  Distribution of bookings by service type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData?.servicePopularity}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData?.servicePopularity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Performer Ratings</CardTitle>
                <CardDescription className="text-gray-400">
                  Distribution of performer ratings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData?.performerRatings} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9CA3AF" />
                    <YAxis dataKey="rating" type="category" stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Booking Status Distribution</CardTitle>
              <CardDescription className="text-gray-400">
                Current status of all bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={analyticsData?.bookingStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analyticsData?.bookingStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}