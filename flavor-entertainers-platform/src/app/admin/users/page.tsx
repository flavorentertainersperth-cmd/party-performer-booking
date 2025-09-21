'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Shield,
  Ban,
  CheckCircle,
  XCircle,
  Edit,
  Trash2
} from 'lucide-react';
import type { Database } from '@/lib/types/database';

type User = Database['public']['Tables']['users']['Row'];

interface UserWithStats extends User {
  booking_count?: number;
  total_spent?: number;
  last_login?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const supabase = createClientComponentClient<Database>();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);

      const { data: usersData, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enhance users with additional stats
      const enhancedUsers = await Promise.all(
        (usersData || []).map(async (user) => {
          // Get booking count and total spent for clients
          if (user.role === 'client') {
            const { data: bookings } = await supabase
              .from('bookings')
              .select('total_amount')
              .eq('client_id', user.id);

            const bookingCount = bookings?.length || 0;
            const totalSpent = bookings?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;

            return {
              ...user,
              booking_count: bookingCount,
              total_spent: totalSpent,
              last_login: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            };
          }

          return {
            ...user,
            last_login: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          };
        })
      );

      setUsers(enhancedUsers);
      setFilteredUsers(enhancedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-900/30 text-red-300 border-red-700/50';
      case 'performer': return 'bg-purple-900/30 text-purple-300 border-purple-700/50';
      case 'client': return 'bg-blue-900/30 text-blue-300 border-blue-700/50';
      default: return 'bg-gray-900/30 text-gray-300 border-gray-700/50';
    }
  };

  const getStatusIcon = (user: UserWithStats) => {
    if (user.email_verified && user.phone_verified) {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    } else if (user.email_verified) {
      return <Shield className="w-4 h-4 text-yellow-400" />;
    } else {
      return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const handleUserAction = async (action: string, user: UserWithStats) => {
    try {
      switch (action) {
        case 'edit':
          setSelectedUser(user);
          setShowUserDialog(true);
          break;
        case 'suspend':
          // Implement user suspension logic
          console.log('Suspending user:', user.id);
          break;
        case 'delete':
          // Implement user deletion logic
          console.log('Deleting user:', user.id);
          break;
        case 'verify':
          // Implement user verification logic
          console.log('Verifying user:', user.id);
          break;
      }
    } catch (error) {
      console.error('Error performing user action:', error);
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
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 mt-1">
            Manage all platform users and their permissions
          </p>
        </div>
        <Button className="brand-gradient hover:opacity-90">
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{users.length}</div>
            <p className="text-xs text-gray-400">All registered users</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Admins</CardTitle>
            <Shield className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <p className="text-xs text-gray-400">Platform administrators</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Performers</CardTitle>
            <Users className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {users.filter(u => u.role === 'performer').length}
            </div>
            <p className="text-xs text-gray-400">Verified performers</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Clients</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {users.filter(u => u.role === 'client').length}
            </div>
            <p className="text-xs text-gray-400">Active clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">User Directory</CardTitle>
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-700 text-white w-64"
                />
              </div>

              {/* Role Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                    <Filter className="w-4 h-4 mr-2" />
                    {roleFilter === 'all' ? 'All Roles' : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-gray-700">
                  <DropdownMenuItem onClick={() => setRoleFilter('all')} className="text-gray-300">
                    All Roles
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoleFilter('admin')} className="text-gray-300">
                    Admins
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoleFilter('performer')} className="text-gray-300">
                    Performers
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoleFilter('client')} className="text-gray-300">
                    Clients
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
                <TableHead className="text-gray-300">User</TableHead>
                <TableHead className="text-gray-300">Role</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Joined</TableHead>
                <TableHead className="text-gray-300">Last Login</TableHead>
                <TableHead className="text-gray-300">Activity</TableHead>
                <TableHead className="text-gray-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-gray-700 hover:bg-gray-800/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profile_picture_url || ''} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs">
                          {user.first_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-white">
                          {user.first_name && user.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : user.email
                          }
                        </div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.role || 'client')}>
                      {user.role || 'client'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(user)}
                      <span className="text-sm text-gray-300">
                        {user.email_verified && user.phone_verified ? 'Verified' :
                         user.email_verified ? 'Email Only' : 'Unverified'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {formatDate(user.created_at || '')}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {user.last_login ? formatDate(user.last_login) : 'Never'}
                  </TableCell>
                  <TableCell>
                    {user.role === 'client' && (
                      <div className="text-sm">
                        <div className="text-white">{user.booking_count || 0} bookings</div>
                        <div className="text-gray-400">
                          {formatCurrency(user.total_spent || 0)} spent
                        </div>
                      </div>
                    )}
                    {user.role === 'performer' && (
                      <div className="text-sm text-gray-300">Performance data</div>
                    )}
                    {user.role === 'admin' && (
                      <div className="text-sm text-gray-300">Admin privileges</div>
                    )}
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
                          onClick={() => handleUserAction('edit', user)}
                          className="text-gray-300 hover:bg-gray-800"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUserAction('verify', user)}
                          className="text-gray-300 hover:bg-gray-800"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Verify Account
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-700" />
                        <DropdownMenuItem
                          onClick={() => handleUserAction('suspend', user)}
                          className="text-yellow-400 hover:bg-yellow-900/20"
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Suspend User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUserAction('delete', user)}
                          className="text-red-400 hover:bg-red-900/20"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
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

      {/* User Edit Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="first-name" className="text-right text-gray-300">
                  First Name
                </Label>
                <Input
                  id="first-name"
                  defaultValue={selectedUser.first_name || ''}
                  className="col-span-3 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="last-name" className="text-right text-gray-300">
                  Last Name
                </Label>
                <Input
                  id="last-name"
                  defaultValue={selectedUser.last_name || ''}
                  className="col-span-3 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  defaultValue={selectedUser.email}
                  className="col-span-3 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right text-gray-300">
                  Phone
                </Label>
                <Input
                  id="phone"
                  defaultValue={selectedUser.phone || ''}
                  className="col-span-3 bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)} className="border-gray-600 text-gray-300">
              Cancel
            </Button>
            <Button className="brand-gradient">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}