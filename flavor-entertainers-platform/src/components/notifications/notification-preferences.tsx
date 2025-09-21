'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Bell,
  MessageSquare,
  Mail,
  Phone,
  Shield,
  DollarSign,
  Calendar,
  Heart,
  Save,
  CheckCircle
} from 'lucide-react';
import type { Database } from '@/lib/types/database';

interface NotificationPrefs {
  email_notifications: boolean;
  sms_notifications: boolean;
  whatsapp_notifications: boolean;
  push_notifications: boolean;
  booking_confirmations: boolean;
  booking_reminders: boolean;
  payment_notifications: boolean;
  safety_alerts: boolean;
  marketing_communications: boolean;
  sms_phone_number?: string;
  whatsapp_phone_number?: string;
}

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPrefs>({
    email_notifications: true,
    sms_notifications: true,
    whatsapp_notifications: false,
    push_notifications: true,
    booking_confirmations: true,
    booking_reminders: true,
    payment_notifications: true,
    safety_alerts: true,
    marketing_communications: false
  });

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

      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (prefs) {
        setPreferences({
          email_notifications: prefs.email_notifications ?? true,
          sms_notifications: prefs.sms_notifications ?? true,
          whatsapp_notifications: prefs.whatsapp_notifications ?? false,
          push_notifications: prefs.push_notifications ?? true,
          booking_confirmations: prefs.booking_confirmations ?? true,
          booking_reminders: prefs.booking_reminders ?? true,
          payment_notifications: prefs.payment_notifications ?? true,
          safety_alerts: prefs.safety_alerts ?? true,
          marketing_communications: prefs.marketing_communications ?? false,
          sms_phone_number: prefs.sms_phone_number || '',
          whatsapp_phone_number: prefs.whatsapp_phone_number || ''
        });
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPrefs, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Notification Preferences</h2>
        <p className="text-gray-400">
          Control how and when you receive notifications
        </p>
      </div>

      {/* Communication Channels */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Communication Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-400" />
              <div>
                <h4 className="text-white font-medium">Email Notifications</h4>
                <p className="text-gray-400 text-sm">Receive notifications via email</p>
              </div>
            </div>
            <Switch
              checked={preferences.email_notifications}
              onCheckedChange={(checked) => updatePreference('email_notifications', checked)}
            />
          </div>

          {/* SMS Notifications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-green-400" />
                <div>
                  <h4 className="text-white font-medium">SMS Notifications</h4>
                  <p className="text-gray-400 text-sm">Receive notifications via text message</p>
                </div>
              </div>
              <Switch
                checked={preferences.sms_notifications}
                onCheckedChange={(checked) => updatePreference('sms_notifications', checked)}
              />
            </div>

            {preferences.sms_notifications && (
              <div>
                <Label htmlFor="smsPhone" className="text-white">SMS Phone Number</Label>
                <Input
                  id="smsPhone"
                  value={preferences.sms_phone_number || ''}
                  onChange={(e) => updatePreference('sms_phone_number', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="+61 400 000 000"
                />
              </div>
            )}
          </div>

          {/* WhatsApp Notifications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-green-400" />
                <div>
                  <h4 className="text-white font-medium">WhatsApp Notifications</h4>
                  <p className="text-gray-400 text-sm">Receive notifications via WhatsApp</p>
                </div>
              </div>
              <Switch
                checked={preferences.whatsapp_notifications}
                onCheckedChange={(checked) => updatePreference('whatsapp_notifications', checked)}
              />
            </div>

            {preferences.whatsapp_notifications && (
              <div>
                <Label htmlFor="whatsappPhone" className="text-white">WhatsApp Phone Number</Label>
                <Input
                  id="whatsappPhone"
                  value={preferences.whatsapp_phone_number || ''}
                  onChange={(e) => updatePreference('whatsapp_phone_number', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="+61 400 000 000"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Must be the same number registered with WhatsApp
                </p>
              </div>
            )}
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-purple-400" />
              <div>
                <h4 className="text-white font-medium">Browser Notifications</h4>
                <p className="text-gray-400 text-sm">Receive notifications in your browser</p>
              </div>
            </div>
            <Switch
              checked={preferences.push_notifications}
              onCheckedChange={(checked) => updatePreference('push_notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notification Types
          </CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Booking Confirmations */}
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-400" />
              <div>
                <h4 className="text-white font-medium">Booking Confirmations</h4>
                <p className="text-gray-400 text-sm">When bookings are confirmed or cancelled</p>
              </div>
            </div>
            <Switch
              checked={preferences.booking_confirmations}
              onCheckedChange={(checked) => updatePreference('booking_confirmations', checked)}
            />
          </div>

          {/* Booking Reminders */}
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-yellow-400" />
              <div>
                <h4 className="text-white font-medium">Booking Reminders</h4>
                <p className="text-gray-400 text-sm">Reminders before upcoming bookings</p>
              </div>
            </div>
            <Switch
              checked={preferences.booking_reminders}
              onCheckedChange={(checked) => updatePreference('booking_reminders', checked)}
            />
          </div>

          {/* Payment Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-green-400" />
              <div>
                <h4 className="text-white font-medium">Payment Notifications</h4>
                <p className="text-gray-400 text-sm">Payment requests, confirmations, and receipts</p>
              </div>
            </div>
            <Switch
              checked={preferences.payment_notifications}
              onCheckedChange={(checked) => updatePreference('payment_notifications', checked)}
            />
          </div>

          {/* Safety Alerts */}
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-red-400" />
              <div>
                <h4 className="text-white font-medium">Safety Alerts</h4>
                <p className="text-gray-400 text-sm">Important safety notifications and DNS updates</p>
              </div>
            </div>
            <Switch
              checked={preferences.safety_alerts}
              onCheckedChange={(checked) => updatePreference('safety_alerts', checked)}
            />
          </div>

          {/* Marketing Communications */}
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-pink-400" />
              <div>
                <h4 className="text-white font-medium">Marketing Communications</h4>
                <p className="text-gray-400 text-sm">Platform updates, tips, and promotional content</p>
              </div>
            </div>
            <Switch
              checked={preferences.marketing_communications}
              onCheckedChange={(checked) => updatePreference('marketing_communications', checked)}
            />
          </div>
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
          onClick={handleSave}
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