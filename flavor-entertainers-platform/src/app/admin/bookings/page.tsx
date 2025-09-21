'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  MapPin,
  User,
  MessageCircle,
  RefreshCw,
  Download
} from 'lucide-react';
import type { Database } from '@/lib/types/database';

type Booking = Database['public']['Tables']['bookings']['Row'];
type BookingStatus = Database['public']['Enums']['booking_status'];

interface BookingWithDetails extends Booking {
  client?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  performer?: {
    stage_name: string;
    bio: string;
    rating: number;
  };
  payment?: {
    status: string;
    amount: number;
    payment_method: string;
  };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const supabase = createClientComponentClient<Database>();

  const fetchBookings = async () => {
    try {
      setIsLoading(true);

      // Fetch bookings with related data
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select(`
          *,
          client:users!bookings_client_id_fkey(first_name, last_name, email, phone),
          performer:performers!bookings_performer_id_fkey(stage_name, bio, rating)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mock enhanced bookings with payment data for demo
      const enhancedBookings = (bookingsData || []).map((booking, index) => ({
        ...booking,
        payment: {
          status: ['completed', 'pending', 'processing'][index % 3],
          amount: booking.total_amount,
          payment_method: ['payid', 'bank_transfer', 'cash'][index % 3]
        }
      }));

      setBookings(enhancedBookings);
      setFilteredBookings(enhancedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    let filtered = bookings;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.booking_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.client?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.performer?.stage_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter]);

  const getStatusBadgeColor = (status: BookingStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50';
      case 'confirmed': return 'bg-blue-900/30 text-blue-300 border-blue-700/50';
      case 'completed': return 'bg-green-900/30 text-green-300 border-green-700/50';
      case 'cancelled': return 'bg-red-900/30 text-red-300 border-red-700/50';
      case 'disputed': return 'bg-purple-900/30 text-purple-300 border-purple-700/50';
      default: return 'bg-gray-900/30 text-gray-300 border-gray-700/50';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'processing': return 'text-blue-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const handleBookingAction = async (action: string, booking: BookingWithDetails) => {
    try {
      switch (action) {
        case 'view':
          setSelectedBooking(booking);
          setShowBookingDialog(true);
          break;
        case 'approve':
          await supabase
            .from('bookings')
            .update({ status: 'confirmed' })
            .eq('id', booking.id);
          fetchBookings();
          break;
        case 'cancel':
          await supabase
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', booking.id);
          fetchBookings();
          break;
        case 'complete':
          await supabase
            .from('bookings')
            .update({ status: 'completed' })
            .eq('id', booking.id);
          fetchBookings();
          break;
      }
    } catch (error) {
      console.error('Error performing booking action:', error);
    }
  };

  const getBookingStats = () => {
    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      revenue: bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.total_amount || 0), 0)
    };
    return stats;
  };

  const stats = getBookingStats();

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
          <h1 className="text-3xl font-bold text-white">Booking Management</h1>
          <p className="text-gray-400 mt-1">
            Monitor and manage all platform bookings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={fetchBookings}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <p className="text-xs text-gray-400">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-900/20 border-yellow-700/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-300">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            <p className="text-xs text-yellow-300/70">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-900/20 border-blue-700/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-300">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{stats.confirmed}</div>
            <p className="text-xs text-blue-300/70">Ready to proceed</p>
          </CardContent>
        </Card>

        <Card className="bg-green-900/20 border-green-700/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-300">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
            <p className="text-xs text-green-300/70">Successful events</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(stats.revenue)}</div>
            <p className="text-xs text-gray-400">From completed bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">All Bookings</CardTitle>
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-700 text-white w-64"
                />
              </div>

              {/* Status Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                    <Filter className="w-4 h-4 mr-2" />
                    {statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-gray-700">
                  <DropdownMenuItem onClick={() => setStatusFilter('all')} className="text-gray-300">
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('pending')} className="text-gray-300">
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('confirmed')} className="text-gray-300">
                    Confirmed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('completed')} className="text-gray-300">
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('cancelled')} className="text-gray-300">
                    Cancelled
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Booking</TableHead>
                <TableHead className="text-gray-300">Client</TableHead>
                <TableHead className="text-gray-300">Performer</TableHead>
                <TableHead className="text-gray-300">Event Date</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Payment</TableHead>
                <TableHead className="text-gray-300">Amount</TableHead>
                <TableHead className="text-gray-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id} className="border-gray-700 hover:bg-gray-800/30">
                  <TableCell>
                    <div>
                      <div className="font-medium text-white">{booking.booking_reference}</div>
                      <div className="text-sm text-gray-400">{booking.event_type}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-white">
                        {booking.client?.first_name} {booking.client?.last_name}
                      </div>
                      <div className="text-sm text-gray-400">{booking.client?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-white">{booking.performer?.stage_name}</div>
                      <div className="flex items-center text-sm text-gray-400">
                        ⭐ {booking.performer?.rating?.toFixed(1) || 'N/A'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {formatDate(booking.event_date)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(booking.status as BookingStatus)}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className={`text-sm ${getPaymentStatusColor(booking.payment?.status || 'pending')}`}>
                      {booking.payment?.status || 'pending'}
                    </div>
                  </TableCell>
                  <TableCell className="text-white font-medium">
                    {formatCurrency(booking.total_amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
                        <DropdownMenuLabel className="text-gray-300">Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleBookingAction('view', booking)}
                          className="text-gray-300 hover:bg-gray-800"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {booking.status === 'pending' && (
                          <DropdownMenuItem
                            onClick={() => handleBookingAction('approve', booking)}
                            className="text-green-400 hover:bg-green-900/20"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                        )}
                        {booking.status === 'confirmed' && (
                          <DropdownMenuItem
                            onClick={() => handleBookingAction('complete', booking)}
                            className="text-blue-400 hover:bg-blue-900/20"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Complete
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-gray-700" />
                        <DropdownMenuItem
                          onClick={() => handleBookingAction('cancel', booking)}
                          className="text-red-400 hover:bg-red-900/20"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel Booking
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              Complete information for booking {selectedBooking?.booking_reference}
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
                <TabsTrigger value="details">Event Details</TabsTrigger>
                <TabsTrigger value="participants">Participants</TabsTrigger>
                <TabsTrigger value="payment">Payment</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300">Event Type</label>
                      <p className="text-white">{selectedBooking.event_type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Description</label>
                      <p className="text-white">{selectedBooking.event_description || 'No description provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Duration</label>
                      <p className="text-white">{selectedBooking.duration_hours} hours</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Guest Count</label>
                      <p className="text-white">{selectedBooking.guest_count || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300">Event Date</label>
                      <p className="text-white">{formatDate(selectedBooking.event_date)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Status</label>
                      <Badge className={getStatusBadgeColor(selectedBooking.status as BookingStatus)}>
                        {selectedBooking.status}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Total Amount</label>
                      <p className="text-white text-lg font-semibold">{formatCurrency(selectedBooking.total_amount)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Special Requirements</label>
                      <p className="text-white">{selectedBooking.special_requirements || 'None specified'}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="participants" className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Client Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-300">Name</label>
                        <p className="text-white">{selectedBooking.client?.first_name} {selectedBooking.client?.last_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-300">Email</label>
                        <p className="text-white">{selectedBooking.client?.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-300">Phone</label>
                        <p className="text-white">{selectedBooking.client?.phone || 'Not provided'}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Performer Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-300">Stage Name</label>
                        <p className="text-white">{selectedBooking.performer?.stage_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-300">Rating</label>
                        <p className="text-white">⭐ {selectedBooking.performer?.rating?.toFixed(1) || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-300">Bio</label>
                        <p className="text-white text-sm">{selectedBooking.performer?.bio || 'No bio available'}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="payment" className="space-y-4">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-300">Payment Status</label>
                        <p className={`font-medium ${getPaymentStatusColor(selectedBooking.payment?.status || 'pending')}`}>
                          {selectedBooking.payment?.status || 'pending'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-300">Payment Method</label>
                        <p className="text-white">{selectedBooking.payment?.payment_method || 'TBD'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-300">Amount</label>
                        <p className="text-white font-semibold">{formatCurrency(selectedBooking.total_amount)}</p>
                      </div>
                    </div>
                    {selectedBooking.deposit_amount && (
                      <div>
                        <label className="text-sm font-medium text-gray-300">Deposit Amount</label>
                        <p className="text-white">{formatCurrency(selectedBooking.deposit_amount)}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookingDialog(false)} className="border-gray-600 text-gray-300">
              Close
            </Button>
            <Button className="brand-gradient">
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Parties
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}