'use client';

import { useState, useEffect } from 'react';
import { PerformerLiveCard } from './performer-live-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Users, Clock, Star } from 'lucide-react';

// Mock data for performers with live availability
const mockPerformers = [
  {
    id: '1',
    stageName: 'Sophia Rose',
    bio: 'Professional dancer and entertainer with 5+ years experience. Specializes in elegant performances and corporate events.',
    profilePicture: '/api/placeholder/300/400',
    rating: 4.9,
    totalReviews: 127,
    isOnline: true,
    location: 'Sydney, NSW',
    performanceTypes: ['Waitressing', 'Corporate Events', 'Private Parties'],
    baseRate: 120,
    isAvailableToday: true,
    availableSlots: ['2:00 PM', '6:00 PM', '8:00 PM', '10:00 PM'],
    featured: true,
    verified: true,
    responseTime: '15min',
    completedBookings: 89
  },
  {
    id: '2',
    stageName: 'Luna Belle',
    bio: 'Captivating performer known for themed shows and creative performances. Available for exclusive bookings.',
    profilePicture: '/api/placeholder/300/400',
    rating: 4.8,
    totalReviews: 95,
    isOnline: true,
    location: 'Melbourne, VIC',
    performanceTypes: ['Strip Shows', 'Theme Parties', 'Bachelor Parties'],
    baseRate: 180,
    isAvailableToday: true,
    availableSlots: ['7:00 PM', '9:00 PM'],
    featured: false,
    verified: true,
    responseTime: '30min',
    completedBookings: 67
  },
  {
    id: '3',
    stageName: 'Aria Phoenix',
    bio: 'Elite entertainer offering premium experiences. Fully licensed and insured for all venue types.',
    profilePicture: '/api/placeholder/300/400',
    rating: 5.0,
    totalReviews: 203,
    isOnline: false,
    lastSeen: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    location: 'Brisbane, QLD',
    performanceTypes: ['Premium Shows', 'VIP Events', 'Corporate'],
    baseRate: 220,
    isAvailableToday: false,
    featured: true,
    verified: true,
    responseTime: '45min',
    completedBookings: 145
  },
  {
    id: '4',
    stageName: 'Scarlett Divine',
    bio: 'Versatile performer specializing in both elegant and playful entertainment for all occasions.',
    profilePicture: '/api/placeholder/300/400',
    rating: 4.7,
    totalReviews: 78,
    isOnline: true,
    location: 'Perth, WA',
    performanceTypes: ['Lap Dance', 'Waitressing', 'Birthday Parties'],
    baseRate: 95,
    isAvailableToday: true,
    availableSlots: ['4:00 PM', '8:00 PM', '11:00 PM'],
    featured: false,
    verified: true,
    responseTime: '1h',
    completedBookings: 52
  },
  {
    id: '5',
    stageName: 'Ruby Starlight',
    bio: 'New to the platform but bringing years of professional experience. Book early for exclusive rates!',
    profilePicture: '/api/placeholder/300/400',
    rating: 4.6,
    totalReviews: 23,
    isOnline: false,
    lastSeen: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    location: 'Adelaide, SA',
    performanceTypes: ['Strip Shows', 'Private Events'],
    baseRate: 140,
    isAvailableToday: true,
    availableSlots: ['6:00 PM', '9:00 PM'],
    featured: false,
    verified: true,
    responseTime: '2h',
    completedBookings: 18
  },
  {
    id: '6',
    stageName: 'Diamond Luxe',
    bio: 'Premium performer offering exclusive high-end entertainment. Perfect for upscale events and VIP occasions.',
    profilePicture: '/api/placeholder/300/400',
    rating: 4.9,
    totalReviews: 156,
    isOnline: true,
    location: 'Gold Coast, QLD',
    performanceTypes: ['VIP Shows', 'Premium Events', 'Luxury Parties'],
    baseRate: 250,
    isAvailableToday: false,
    featured: true,
    verified: true,
    responseTime: '20min',
    completedBookings: 112
  }
];

export function LivePerformersGrid() {
  const [performers, setPerformers] = useState(mockPerformers);
  const [filter, setFilter] = useState<'all' | 'online' | 'available'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredPerformers = performers.filter((performer) => {
    switch (filter) {
      case 'online':
        return performer.isOnline;
      case 'available':
        return performer.isAvailableToday;
      default:
        return true;
    }
  });

  const onlineCount = performers.filter(p => p.isOnline).length;
  const availableCount = performers.filter(p => p.isAvailableToday).length;

  const refreshData = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate some performers going online/offline
    setPerformers(prev => prev.map(performer => ({
      ...performer,
      isOnline: Math.random() > 0.3, // 70% chance of being online
      isAvailableToday: Math.random() > 0.4 // 60% chance of being available
    })));

    setIsRefreshing(false);
  };

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with Stats and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white">
            Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Performers</span>
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>{onlineCount} online</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{availableCount} available today</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{performers.length} total performers</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={refreshData}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'border-gray-600 text-gray-300 hover:bg-gray-800'}
        >
          All Performers
          <Badge variant="secondary" className="ml-2">
            {performers.length}
          </Badge>
        </Button>
        <Button
          variant={filter === 'online' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('online')}
          className={filter === 'online' ? 'bg-gradient-to-r from-green-500 to-green-600' : 'border-gray-600 text-gray-300 hover:bg-gray-800'}
        >
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Online Now
          <Badge variant="secondary" className="ml-2">
            {onlineCount}
          </Badge>
        </Button>
        <Button
          variant={filter === 'available' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('available')}
          className={filter === 'available' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'border-gray-600 text-gray-300 hover:bg-gray-800'}
        >
          Available Today
          <Badge variant="secondary" className="ml-2">
            {availableCount}
          </Badge>
        </Button>
      </div>

      {/* Performers Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPerformers.map((performer) => (
          <PerformerLiveCard key={performer.id} performer={performer} />
        ))}
      </div>

      {filteredPerformers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No performers found</h3>
          <p className="text-gray-600 mb-4">
            {filter === 'online' && 'No performers are currently online.'}
            {filter === 'available' && 'No performers are available today.'}
            {filter === 'all' && 'No performers match your criteria.'}
          </p>
          <Button onClick={() => setFilter('all')} variant="outline">
            View All Performers
          </Button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-800">Online</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{onlineCount}</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3 h-3 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Available</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{availableCount}</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-3 h-3 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Avg Rating</span>
          </div>
          <div className="text-2xl font-bold text-yellow-900">
            {(performers.reduce((acc, p) => acc + (p.rating || 0), 0) / performers.length).toFixed(1)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-3 h-3 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Total</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">{performers.length}</div>
        </div>
      </div>
    </div>
  );
}