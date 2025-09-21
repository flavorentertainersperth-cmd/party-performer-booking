'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Clock,
  Shield,
  CheckCircle,
  AlertTriangle,
  Navigation,
  Calendar,
  MapIcon,
  Loader2
} from 'lucide-react';
import type { Database } from '@/lib/types/database';

interface LocationCheckInProps {
  onCheckIn: () => void;
}

interface CheckIn {
  id: string;
  check_in_type: string;
  location_lat: number | null;
  location_lng: number | null;
  notes: string | null;
  is_safe: boolean;
  created_at: string;
  booking_id: string | null;
}

interface BookingOption {
  id: string;
  event_date: string;
  event_time: string;
  client_name: string;
  venue_name: string;
}

const checkInTypes = [
  { value: 'arrival', label: 'Arrival Check-in', description: 'Checking in at booking location', icon: MapPin },
  { value: 'safety_check', label: 'Safety Check', description: 'Regular safety update', icon: Shield },
  { value: 'departure', label: 'Departure Check-in', description: 'Leaving booking location', icon: CheckCircle },
  { value: 'emergency', label: 'Emergency Check-in', description: 'Emergency situation', icon: AlertTriangle }
];

export function LocationCheckIn({ onCheckIn }: LocationCheckInProps) {
  const [checkInType, setCheckInType] = useState('');
  const [selectedBooking, setSelectedBooking] = useState('');
  const [notes, setNotes] = useState('');
  const [isSafe, setIsSafe] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<BookingOption[]>([]);

  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get performer ID
      const { data: performer } = await supabase
        .from('performers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!performer) return;

      // Load recent check-ins
      const { data: checkIns } = await supabase
        .from('performer_check_ins')
        .select('*')
        .eq('performer_id', performer.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentCheckIns(checkIns || []);

      // Load upcoming bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          id,
          event_date,
          event_time,
          client_name,
          venue_name,
          status
        `)
        .eq('performer_id', performer.id)
        .in('status', ['confirmed', 'in_progress'])
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .limit(10);

      setUpcomingBookings(bookings || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Failed to get current location. Please try again.');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleCheckIn = async () => {
    if (!checkInType) {
      alert('Please select a check-in type');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get performer ID
      const { data: performer } = await supabase
        .from('performers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!performer) throw new Error('Performer not found');

      // Create check-in record
      const { error } = await supabase
        .from('performer_check_ins')
        .insert({
          performer_id: performer.id,
          booking_id: selectedBooking || null,
          check_in_type: checkInType,
          location_lat: location?.lat || null,
          location_lng: location?.lng || null,
          notes: notes || null,
          is_safe: isSafe
        });

      if (error) throw error;

      // Reset form
      setCheckInType('');
      setSelectedBooking('');
      setNotes('');
      setIsSafe(true);
      setLocation(null);

      // Reload data
      loadData();
      onCheckIn();

    } catch (error) {
      console.error('Error submitting check-in:', error);
      alert('Failed to submit check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCheckInTypeIcon = (type: string) => {
    const checkInType = checkInTypes.find(t => t.value === type);
    return checkInType?.icon || MapPin;
  };

  const getCheckInTypeColor = (type: string) => {
    switch (type) {
      case 'arrival': return 'bg-blue-900/30 text-blue-300 border-blue-700/50';
      case 'safety_check': return 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50';
      case 'departure': return 'bg-green-900/30 text-green-300 border-green-700/50';
      case 'emergency': return 'bg-red-900/30 text-red-300 border-red-700/50';
      default: return 'bg-gray-900/30 text-gray-300 border-gray-700/50';
    }
  };

  const selectedCheckInType = checkInTypes.find(t => t.value === checkInType);

  return (
    <div className="space-y-6">
      {/* Check-in Form */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Safety Check-in
          </CardTitle>
          <CardDescription>
            Record your location and safety status during bookings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Check-in Type */}
          <div>
            <Label className="text-white">Check-in Type *</Label>
            <Select value={checkInType} onValueChange={setCheckInType}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select check-in type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {checkInTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        <Icon className="w-4 h-4 mr-2" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-400">{type.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Booking Association */}
          {upcomingBookings.length > 0 && (
            <div>
              <Label className="text-white">Associated Booking (Optional)</Label>
              <Select value={selectedBooking} onValueChange={setSelectedBooking}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select booking" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {upcomingBookings.map((booking) => (
                    <SelectItem key={booking.id} value={booking.id}>
                      <div>
                        <div className="font-medium">{booking.client_name}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(booking.event_date).toLocaleDateString()} at {booking.event_time}
                        </div>
                        <div className="text-xs text-gray-500">{booking.venue_name}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Location */}
          <div>
            <Label className="text-white">Location</Label>
            <div className="flex gap-2 items-center">
              <Button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                {isGettingLocation ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4 mr-2" />
                )}
                {isGettingLocation ? 'Getting Location...' : 'Get Current Location'}
              </Button>
              {location && (
                <div className="flex items-center text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Location captured
                </div>
              )}
            </div>
            {location && (
              <p className="text-gray-400 text-xs mt-1">
                Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
              </p>
            )}
          </div>

          {/* Safety Status */}
          {selectedCheckInType && selectedCheckInType.value !== 'departure' && (
            <div>
              <Label className="text-white">Safety Status *</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  onClick={() => setIsSafe(true)}
                  variant={isSafe ? "default" : "outline"}
                  className={
                    isSafe
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "border-gray-600 text-gray-300 hover:bg-gray-800"
                  }
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  I'm Safe
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsSafe(false)}
                  variant={!isSafe ? "default" : "outline"}
                  className={
                    !isSafe
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "border-gray-600 text-gray-300 hover:bg-gray-800"
                  }
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Need Help
                </Button>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-white">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="Additional details about your check-in..."
              rows={3}
            />
          </div>

          {/* Emergency Warning */}
          {checkInType === 'emergency' && (
            <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-red-300 font-medium text-sm mb-1">Emergency Check-in</h4>
                  <p className="text-red-200/80 text-xs">
                    This will immediately notify your emergency contact and our safety team.
                    If this is a life-threatening emergency, call 000 first.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleCheckIn}
            disabled={isSubmitting || !checkInType}
            className="w-full brand-gradient"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting Check-in...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                Submit Check-in
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Check-ins */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Recent Check-ins
          </CardTitle>
          <CardDescription>
            Your recent safety check-ins and location updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentCheckIns.length > 0 ? (
              recentCheckIns.map((checkIn) => {
                const Icon = getCheckInTypeIcon(checkIn.check_in_type);
                return (
                  <div key={checkIn.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-700 rounded-lg">
                        <Icon className="w-4 h-4 text-gray-300" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">
                            {checkIn.check_in_type.replace('_', ' ').toUpperCase()}
                          </span>
                          <Badge className={getCheckInTypeColor(checkIn.check_in_type)}>
                            {checkIn.is_safe ? 'Safe' : 'Needs Help'}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-sm">
                          {new Date(checkIn.created_at).toLocaleString()}
                        </p>
                        {checkIn.notes && (
                          <p className="text-gray-300 text-xs mt-1">{checkIn.notes}</p>
                        )}
                      </div>
                    </div>
                    {checkIn.location_lat && checkIn.location_lng && (
                      <div className="text-gray-400">
                        <MapIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No check-ins yet</p>
                <p className="text-gray-500 text-sm">Your safety check-ins will appear here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}