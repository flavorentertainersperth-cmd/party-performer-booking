'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Bell,
  MapPin,
  Clock,
  Phone,
  AlertTriangle,
  Settings,
  Save,
  User,
  Heart,
  CheckCircle
} from 'lucide-react';
import type { Database } from '@/lib/types/database';

interface SafetyPreferences {
  id?: string;
  performer_id: string;
  enable_dns_notifications: boolean;
  enable_safety_alerts: boolean;
  enable_location_sharing: boolean;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  safety_check_interval: number;
  auto_check_in_required: boolean;
  blocked_areas: string[];
  preferred_venues: string[];
  safety_notes: string;
}

const checkIntervals = [
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 240, label: '4 hours' },
  { value: 480, label: '8 hours' }
];

const relationships = [
  'Partner/Spouse',
  'Family Member',
  'Friend',
  'Colleague',
  'Manager/Agent',
  'Other'
];

export function SafetyPreferencesForm() {
  const [preferences, setPreferences] = useState<SafetyPreferences>({
    performer_id: '',
    enable_dns_notifications: true,
    enable_safety_alerts: true,
    enable_location_sharing: false,
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    safety_check_interval: 60,
    auto_check_in_required: false,
    blocked_areas: [],
    preferred_venues: [],
    safety_notes: ''
  });

  const [newBlockedArea, setNewBlockedArea] = useState('');
  const [newPreferredVenue, setNewPreferredVenue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
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

      // Load existing preferences
      const { data: prefs } = await supabase
        .from('performer_safety_preferences')
        .select('*')
        .eq('performer_id', performer.id)
        .single();

      if (prefs) {
        setPreferences({
          ...prefs,
          blocked_areas: Array.isArray(prefs.blocked_areas) ? prefs.blocked_areas : [],
          preferred_venues: Array.isArray(prefs.preferred_venues) ? prefs.preferred_venues : []
        });
      } else {
        setPreferences(prev => ({
          ...prev,
          performer_id: performer.id
        }));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('performer_safety_preferences')
        .upsert({
          performer_id: preferences.performer_id,
          enable_dns_notifications: preferences.enable_dns_notifications,
          enable_safety_alerts: preferences.enable_safety_alerts,
          enable_location_sharing: preferences.enable_location_sharing,
          emergency_contact_name: preferences.emergency_contact_name || null,
          emergency_contact_phone: preferences.emergency_contact_phone || null,
          emergency_contact_relationship: preferences.emergency_contact_relationship || null,
          safety_check_interval: preferences.safety_check_interval,
          auto_check_in_required: preferences.auto_check_in_required,
          blocked_areas: preferences.blocked_areas,
          preferred_venues: preferences.preferred_venues,
          safety_notes: preferences.safety_notes || null
        }, {
          onConflict: 'performer_id'
        });

      if (error) throw error;

      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const addBlockedArea = () => {
    if (newBlockedArea.trim() && !preferences.blocked_areas.includes(newBlockedArea.trim())) {
      setPreferences(prev => ({
        ...prev,
        blocked_areas: [...prev.blocked_areas, newBlockedArea.trim()]
      }));
      setNewBlockedArea('');
    }
  };

  const removeBlockedArea = (area: string) => {
    setPreferences(prev => ({
      ...prev,
      blocked_areas: prev.blocked_areas.filter(a => a !== area)
    }));
  };

  const addPreferredVenue = () => {
    if (newPreferredVenue.trim() && !preferences.preferred_venues.includes(newPreferredVenue.trim())) {
      setPreferences(prev => ({
        ...prev,
        preferred_venues: [...prev.preferred_venues, newPreferredVenue.trim()]
      }));
      setNewPreferredVenue('');
    }
  };

  const removePreferredVenue = (venue: string) => {
    setPreferences(prev => ({
      ...prev,
      preferred_venues: prev.preferred_venues.filter(v => v !== venue)
    }));
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifications & Alerts */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notifications & Alerts
          </CardTitle>
          <CardDescription>
            Configure how you receive safety notifications and alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
            <div className="flex-1">
              <h4 className="text-white font-medium">DNS Notifications</h4>
              <p className="text-gray-400 text-sm">Get notified when clients are added to the Do Not Serve registry</p>
            </div>
            <Switch
              checked={preferences.enable_dns_notifications}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, enable_dns_notifications: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
            <div className="flex-1">
              <h4 className="text-white font-medium">Safety Alerts</h4>
              <p className="text-gray-400 text-sm">Receive area-specific safety alerts and warnings</p>
            </div>
            <Switch
              checked={preferences.enable_safety_alerts}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, enable_safety_alerts: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
            <div className="flex-1">
              <h4 className="text-white font-medium">Location Sharing</h4>
              <p className="text-gray-400 text-sm">Share your location with emergency contacts during bookings</p>
            </div>
            <Switch
              checked={preferences.enable_location_sharing}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, enable_location_sharing: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Phone className="w-5 h-5 mr-2" />
            Emergency Contact
          </CardTitle>
          <CardDescription>
            Provide details for someone to contact in case of emergency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="emergencyName" className="text-white">
              Contact Name
            </Label>
            <Input
              id="emergencyName"
              value={preferences.emergency_contact_name}
              onChange={(e) => setPreferences(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="Full name"
            />
          </div>

          <div>
            <Label htmlFor="emergencyPhone" className="text-white">
              Contact Phone
            </Label>
            <Input
              id="emergencyPhone"
              type="tel"
              value={preferences.emergency_contact_phone}
              onChange={(e) => setPreferences(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="+61 xxx xxx xxx"
            />
          </div>

          <div>
            <Label className="text-white">Relationship</Label>
            <Select
              value={preferences.emergency_contact_relationship}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, emergency_contact_relationship: value }))}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {relationships.map((relationship) => (
                  <SelectItem key={relationship} value={relationship}>
                    {relationship}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Safety Check-ins */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Safety Check-ins
          </CardTitle>
          <CardDescription>
            Configure automatic safety check-in reminders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white">Check-in Interval</Label>
            <Select
              value={preferences.safety_check_interval.toString()}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, safety_check_interval: parseInt(value) }))}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {checkIntervals.map((interval) => (
                  <SelectItem key={interval.value} value={interval.value.toString()}>
                    {interval.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-gray-400 text-xs mt-1">
              How often you'll be reminded to check in during bookings
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
            <div className="flex-1">
              <h4 className="text-white font-medium">Auto Check-in Required</h4>
              <p className="text-gray-400 text-sm">Require check-ins for all bookings</p>
            </div>
            <Switch
              checked={preferences.auto_check_in_required}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, auto_check_in_required: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location Preferences */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Location Preferences
          </CardTitle>
          <CardDescription>
            Manage blocked areas and preferred venues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Blocked Areas */}
          <div>
            <Label className="text-white">Blocked Areas</Label>
            <p className="text-gray-400 text-sm mb-3">
              Areas where you don't accept bookings for safety reasons
            </p>
            <div className="flex gap-2 mb-3">
              <Input
                value={newBlockedArea}
                onChange={(e) => setNewBlockedArea(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Enter suburb or area name"
                onKeyPress={(e) => e.key === 'Enter' && addBlockedArea()}
              />
              <Button
                type="button"
                onClick={addBlockedArea}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.blocked_areas.map((area) => (
                <Badge
                  key={area}
                  variant="secondary"
                  className="bg-red-900/30 text-red-300 border-red-700/50 cursor-pointer hover:bg-red-900/50"
                  onClick={() => removeBlockedArea(area)}
                >
                  {area} ×
                </Badge>
              ))}
            </div>
          </div>

          {/* Preferred Venues */}
          <div>
            <Label className="text-white">Preferred Venues</Label>
            <p className="text-gray-400 text-sm mb-3">
              Venues you feel safe working at and prefer to book
            </p>
            <div className="flex gap-2 mb-3">
              <Input
                value={newPreferredVenue}
                onChange={(e) => setNewPreferredVenue(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Enter venue name"
                onKeyPress={(e) => e.key === 'Enter' && addPreferredVenue()}
              />
              <Button
                type="button"
                onClick={addPreferredVenue}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.preferred_venues.map((venue) => (
                <Badge
                  key={venue}
                  variant="secondary"
                  className="bg-green-900/30 text-green-300 border-green-700/50 cursor-pointer hover:bg-green-900/50"
                  onClick={() => removePreferredVenue(venue)}
                >
                  {venue} ×
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Notes */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Safety Notes
          </CardTitle>
          <CardDescription>
            Personal safety notes and reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={preferences.safety_notes}
            onChange={(e) => setPreferences(prev => ({ ...prev, safety_notes: e.target.value }))}
            className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
            placeholder="Private notes about safety preferences, concerns, or reminders..."
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div>
          {lastSaved && (
            <div className="flex items-center text-green-400 text-sm">
              <CheckCircle className="w-4 h-4 mr-1" />
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </div>
        <Button
          onClick={handleSavePreferences}
          disabled={isSaving}
          className="brand-gradient"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}