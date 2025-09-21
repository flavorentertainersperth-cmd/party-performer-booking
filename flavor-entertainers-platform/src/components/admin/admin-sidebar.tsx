'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  CreditCard,
  MessageSquare,
  Settings,
  TrendingUp,
  Shield,
  Bell,
  FileText,
  ChevronLeft,
  ChevronRight,
  Heart
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Overview and analytics'
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: TrendingUp,
    description: 'Platform metrics'
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    description: 'Manage all users'
  },
  {
    name: 'Performers',
    href: '/admin/performers',
    icon: UserCheck,
    description: 'Performer management'
  },
  {
    name: 'Vetting',
    href: '/admin/vetting',
    icon: Shield,
    description: 'Application reviews'
  },
  {
    name: 'Bookings',
    href: '/admin/bookings',
    icon: Calendar,
    description: 'Booking management'
  },
  {
    name: 'Payments',
    href: '/admin/payments',
    icon: CreditCard,
    description: 'Payment processing'
  },
  {
    name: 'Messages',
    href: '/admin/messages',
    icon: MessageSquare,
    description: 'Platform communications'
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: FileText,
    description: 'Generate reports'
  },
  {
    name: 'Notifications',
    href: '/admin/notifications',
    icon: Bell,
    description: 'System notifications'
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'Platform settings'
  }
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className={cn(
      "bg-gray-900/95 backdrop-blur border-r border-gray-800 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 brand-gradient rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Admin Panel</h2>
                <p className="text-xs text-gray-400">Flavor Entertainers</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-gray-800/50"
              )}
            >
              <item.icon className={cn(
                "flex-shrink-0 transition-all duration-200",
                collapsed ? "w-5 h-5" : "w-5 h-5 mr-3",
                isActive ? "text-white" : "text-gray-400 group-hover:text-white"
              )} />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs opacity-75 truncate">{item.description}</div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Status Indicator */}
      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">System Online</span>
            </div>
            <p className="text-xs text-green-300/70 mt-1">All services operational</p>
          </div>
        </div>
      )}
    </div>
  );
}