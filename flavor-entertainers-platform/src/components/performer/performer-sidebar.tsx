'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Calendar,
  DollarSign,
  User,
  Star,
  Shield,
  Settings,
  Bell,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  Heart,
  AlertTriangle,
  FileText,
  BarChart3,
  CheckCircle
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard/performer',
    icon: LayoutDashboard,
    description: 'Overview and stats'
  },
  {
    name: 'Bookings',
    href: '/dashboard/performer/bookings',
    icon: Calendar,
    description: 'Your bookings'
  },
  {
    name: 'Availability',
    href: '/dashboard/performer/availability',
    icon: Clock,
    description: 'Set your schedule'
  },
  {
    name: 'Earnings',
    href: '/dashboard/performer/earnings',
    icon: DollarSign,
    description: 'Track payments'
  },
  {
    name: 'Profile',
    href: '/dashboard/performer/profile',
    icon: User,
    description: 'Manage profile'
  },
  {
    name: 'Reviews',
    href: '/dashboard/performer/reviews',
    icon: Star,
    description: 'Customer feedback'
  },
  {
    name: 'Analytics',
    href: '/dashboard/performer/analytics',
    icon: BarChart3,
    description: 'Performance metrics'
  },
  {
    name: 'Safety Center',
    href: '/dashboard/performer/safety',
    icon: Shield,
    description: 'Safety tools & DNS'
  },
  {
    name: 'Reports',
    href: '/dashboard/performer/reports',
    icon: FileText,
    description: 'Submit reports'
  },
  {
    name: 'Notifications',
    href: '/dashboard/performer/notifications',
    icon: Bell,
    description: 'Your alerts'
  },
  {
    name: 'Settings',
    href: '/dashboard/performer/settings',
    icon: Settings,
    description: 'Account settings'
  }
];

interface PerformerSidebarProps {
  performer: any;
}

export function PerformerSidebar({ performer }: PerformerSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const getVerificationStatus = () => {
    if (performer.verified) {
      return { text: 'Verified', color: 'bg-green-900/30 text-green-300 border-green-700/50', icon: CheckCircle };
    }
    return { text: 'Pending', color: 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50', icon: Clock };
  };

  const status = getVerificationStatus();

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
                <h2 className="text-lg font-bold text-white">Performer</h2>
                <p className="text-xs text-gray-400">Dashboard</p>
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

      {/* Performer Profile Summary */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {performer.stage_name?.charAt(0) || 'P'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white truncate">{performer.stage_name}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={status.color}>
                  <status.icon className="w-3 h-3 mr-1" />
                  {status.text}
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-300">Rating</span>
              </div>
              <div className="text-lg font-bold text-white">
                {performer.rating?.toFixed(1) || '0.0'}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">Bookings</span>
              </div>
              <div className="text-lg font-bold text-white">
                {performer.total_bookings || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-2 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard/performer' && pathname.startsWith(item.href));

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
              {!collapsed && item.name === 'Notifications' && (
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Safety Status */}
      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400 font-medium">Safety Tools Active</span>
            </div>
            <p className="text-xs text-green-300/70 mt-1">
              DNS system enabled
            </p>
          </div>
        </div>
      )}
    </div>
  );
}