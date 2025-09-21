'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Search, Settings, LogOut, User, Home, Shield, AlertTriangle, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Database } from '@/lib/types/database';

interface PerformerHeaderProps {
  user: any;
  performer: any;
}

export function PerformerHeader({ user, performer }: PerformerHeaderProps) {
  const [notifications, setNotifications] = useState(0);
  const [safetyAlerts, setSafetyAlerts] = useState(0);
  const [isOnline, setIsOnline] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const getNotifications = async () => {
      // Get unread notifications count
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('read_at', null);

      setNotifications(count || 0);

      // Get active safety alerts
      const { count: alertCount } = await supabase
        .from('safety_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .contains('target_audience', ['performers']);

      setSafetyAlerts(alertCount || 0);
    };

    getNotifications();
  }, [supabase, user.id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    // TODO: Update performer online status in database
  };

  return (
    <header className="bg-gray-900/95 backdrop-blur border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search bookings, clients, reviews..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Status and Actions */}
        <div className="flex items-center gap-4">
          {/* Online Status Toggle */}
          <Button
            onClick={toggleOnlineStatus}
            variant="ghost"
            size="sm"
            className={cn(
              "relative transition-all duration-200",
              isOnline
                ? "text-green-400 hover:text-green-300 bg-green-900/20"
                : "text-gray-400 hover:text-white"
            )}
          >
            <div className={cn(
              "w-2 h-2 rounded-full mr-2",
              isOnline ? "bg-green-500 animate-pulse" : "bg-gray-500"
            )}></div>
            {isOnline ? 'Online' : 'Offline'}
          </Button>

          {/* Safety Alerts */}
          {safetyAlerts > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="relative text-red-400 hover:text-red-300 bg-red-900/20"
              onClick={() => router.push('/dashboard/performer/safety')}
            >
              <AlertTriangle className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {safetyAlerts}
              </span>
            </Button>
          )}

          {/* Location Check-in */}
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            onClick={() => router.push('/dashboard/performer/safety')}
          >
            <MapPin className="w-5 h-5" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative text-gray-400 hover:text-white"
            onClick={() => router.push('/dashboard/performer/notifications')}
          >
            <Bell className="w-5 h-5" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications > 9 ? '9+' : notifications}
              </span>
            )}
          </Button>

          {/* Quick Actions */}
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            onClick={() => router.push('/')}
          >
            <Home className="w-5 h-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={performer?.stage_name} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    {performer?.stage_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-white">
                    {performer?.stage_name}
                  </p>
                  <p className="text-xs leading-none text-gray-400">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={performer?.verified
                      ? "bg-green-900/30 text-green-300 border-green-700/50"
                      : "bg-yellow-900/30 text-yellow-300 border-yellow-700/50"
                    }>
                      {performer?.verified ? 'Verified' : 'Pending'}
                    </Badge>
                    <Badge className="bg-purple-900/30 text-purple-300 border-purple-700/50">
                      ⭐ {performer?.rating?.toFixed(1) || '0.0'}
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem
                className="text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={() => router.push('/dashboard/performer/profile')}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={() => router.push('/dashboard/performer/safety')}
              >
                <Shield className="mr-2 h-4 w-4" />
                <span>Safety Center</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={() => router.push('/dashboard/performer/settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}