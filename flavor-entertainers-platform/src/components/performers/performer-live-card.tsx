'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Star, MapPin, Clock, Sparkles, Eye, MessageCircle, Calendar } from 'lucide-react';
import Link from 'next/link';

interface PerformerLiveCardProps {
  performer: {
    id: string;
    stageName: string;
    bio?: string;
    profilePicture?: string;
    rating?: number;
    totalReviews: number;
    isOnline: boolean;
    lastSeen?: string;
    location: string;
    performanceTypes: string[];
    baseRate?: number;
    isAvailableToday: boolean;
    availableSlots?: string[];
    featured: boolean;
    verified: boolean;
    responseTime?: string;
    completedBookings?: number;
  };
}

export function PerformerLiveCard({ performer }: PerformerLiveCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const getOnlineStatusColor = () => {
    if (performer.isOnline) return 'bg-green-500';
    if (performer.lastSeen && isRecentlyOnline(performer.lastSeen)) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getOnlineStatusText = () => {
    if (performer.isOnline) return 'Online now';
    if (performer.lastSeen && isRecentlyOnline(performer.lastSeen)) return 'Recently online';
    return 'Offline';
  };

  const isRecentlyOnline = (lastSeen: string) => {
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60);
    return diffInMinutes <= 30; // Consider recently online if within 30 minutes
  };

  return (
    <Card className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2">
      {/* Featured Badge */}
      {performer.featured && (
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
            <Sparkles className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        </div>
      )}

      {/* Like Button */}
      <button
        onClick={() => setIsLiked(!isLiked)}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-all duration-300 group-hover:scale-110"
      >
        <Heart
          className={`w-4 h-4 transition-all duration-300 ${
            isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
          }`}
        />
      </button>

      {/* Profile Image Section */}
      <div className="relative h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-600 opacity-20"></div>
        {performer.profilePicture ? (
          <img
            src={performer.profilePicture}
            alt={performer.stageName}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsImageLoaded(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-400 to-purple-600 flex items-center justify-center">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="text-white text-2xl font-bold bg-transparent">
                {performer.stageName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        {/* Online Status Indicator */}
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full">
            <div className={`w-2 h-2 rounded-full ${getOnlineStatusColor()} ${performer.isOnline ? 'animate-pulse' : ''}`}></div>
            <span className="text-white text-xs font-medium">
              {getOnlineStatusText()}
            </span>
          </div>
        </div>

        {/* Verified Badge */}
        {performer.verified && (
          <div className="absolute bottom-3 right-3">
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/90 backdrop-blur-sm rounded-full">
              <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              </div>
              <span className="text-white text-xs font-medium">Verified</span>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-5 space-y-4">
        {/* Header Info */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
              {performer.stageName}
            </h3>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold text-gray-700">
                {performer.rating?.toFixed(1) || 'New'}
              </span>
              <span className="text-xs text-gray-500">
                ({performer.totalReviews})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{performer.location}</span>
          </div>
        </div>

        {/* Bio */}
        {performer.bio && (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {performer.bio}
          </p>
        )}

        {/* Performance Types */}
        <div className="flex flex-wrap gap-1.5">
          {performer.performanceTypes.slice(0, 3).map((type, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors duration-300"
            >
              {type}
            </Badge>
          ))}
          {performer.performanceTypes.length > 3 && (
            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
              +{performer.performanceTypes.length - 3} more
            </Badge>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{performer.completedBookings || 0} bookings</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              <span>Responds in {performer.responseTime || '1h'}</span>
            </div>
          </div>
        </div>

        {/* Availability Section */}
        {performer.isAvailableToday && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Available Today</span>
            </div>
            {performer.availableSlots && performer.availableSlots.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {performer.availableSlots.slice(0, 3).map((slot, index) => (
                  <Badge
                    key={index}
                    className="bg-green-100 text-green-700 border-green-300 text-xs"
                  >
                    {slot}
                  </Badge>
                ))}
                {performer.availableSlots.length > 3 && (
                  <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                    +{performer.availableSlots.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}

        {/* Price and Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div>
            {performer.baseRate && (
              <div className="text-lg font-bold text-gray-900">
                ${performer.baseRate}
                <span className="text-sm font-normal text-gray-500">/hr</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Link href={`/performers/${performer.id}`}>
              <Button
                size="sm"
                variant="outline"
                className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
              >
                View Profile
              </Button>
            </Link>
            <Button
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Book Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}