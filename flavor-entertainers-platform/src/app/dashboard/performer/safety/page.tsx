'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  AlertTriangle,
  Plus,
  FileText,
  MapPin,
  Clock,
  CheckCircle,
  Eye,
  TrendingUp,
  Users
} from 'lucide-react';
import { ReportIncidentForm } from '@/components/performer/report-incident-form';
import { SafetyPreferencesForm } from '@/components/performer/safety-preferences-form';
import { LocationCheckIn } from '@/components/performer/location-checkin';
import type { Database } from '@/lib/types/database';

interface SafetyStats {
  totalReports: number;
  activeAlerts: number;
  checkInsToday: number;
  dnsEntries: number;
}

interface RecentReport {
  id: string;
  report_type: string;
  status: string;
  created_at: string;
  client_email: string;
  severity_level: number;
}

interface SafetyAlert {
  id: string;
  title: string;
  message: string;
  severity_level: number;
  created_at: string;
}

export default function SafetyCenter() {
  const [stats, setStats] = useState<SafetyStats>({
    totalReports: 0,
    activeAlerts: 0,
    checkInsToday: 0,
    dnsEntries: 0
  });
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    loadSafetyData();
  }, []);

  const loadSafetyData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get performer ID
      const { data: performer } = await supabase
        .from('performers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!performer) return;

      // Load safety statistics
      const [reportsResponse, alertsResponse, checkInsResponse, dnsResponse] = await Promise.all([
        // My reports count
        supabase
          .from('do_not_serve_registry')
          .select('id', { count: 'exact' })
          .eq('reported_by', user.id),

        // Active safety alerts
        supabase
          .from('safety_alerts')
          .select('id', { count: 'exact' })
          .eq('is_active', true)
          .contains('target_audience', ['performers']),

        // Today's check-ins
        supabase
          .from('performer_check_ins')
          .select('id', { count: 'exact' })
          .eq('performer_id', performer.id)
          .gte('created_at', new Date().toISOString().split('T')[0]),

        // Total DNS entries
        supabase
          .from('do_not_serve_registry')
          .select('id', { count: 'exact' })
          .eq('is_active', true)
      ]);

      setStats({
        totalReports: reportsResponse.count || 0,
        activeAlerts: alertsResponse.count || 0,
        checkInsToday: checkInsResponse.count || 0,
        dnsEntries: dnsResponse.count || 0
      });

      // Load recent reports
      const { data: reports } = await supabase
        .from('do_not_serve_registry')
        .select('id, report_type, status, created_at, client_email, severity_level')
        .eq('reported_by', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentReports(reports || []);

      // Load safety alerts
      const { data: alerts } = await supabase
        .from('safety_alerts')
        .select('id, title, message, severity_level, created_at')
        .eq('is_active', true)
        .contains('target_audience', ['performers'])
        .order('created_at', { ascending: false })
        .limit(5);

      setSafetyAlerts(alerts || []);

    } catch (error) {
      console.error('Error loading safety data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-red-900/30 text-red-300 border-red-700/50';
      case 'under_review': return 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50';
      case 'dismissed': return 'bg-gray-900/30 text-gray-300 border-gray-700/50';
      default: return 'bg-blue-900/30 text-blue-300 border-blue-700/50';
    }
  };

  const getSeverityColor = (level: number) => {
    if (level >= 4) return 'text-red-400';
    if (level >= 3) return 'text-yellow-400';
    return 'text-green-400';
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
          <h1 className="text-3xl font-bold text-white mb-2">Safety Center</h1>
          <p className="text-gray-400">
            Manage your safety preferences, report incidents, and stay protected
          </p>
        </div>
        <Button
          onClick={() => setShowReportForm(true)}
          className="brand-gradient"
        >
          <Plus className="w-4 h-4 mr-2" />
          Report Incident
        </Button>
      </div>

      {/* Safety Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-900/30 rounded-lg">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{stats.totalReports}</p>
                <p className="text-gray-400 text-sm">My Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{stats.activeAlerts}</p>
                <p className="text-gray-400 text-sm">Active Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-900/30 rounded-lg">
                <MapPin className="w-6 h-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{stats.checkInsToday}</p>
                <p className="text-gray-400 text-sm">Check-ins Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-900/30 rounded-lg">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{stats.dnsEntries}</p>
                <p className="text-gray-400 text-sm">DNS Registry</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">My Reports</TabsTrigger>
          <TabsTrigger value="checkin">Check-in</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="preferences">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Reports */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Recent Reports
                </CardTitle>
                <CardDescription>Your latest incident reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentReports.length > 0 ? (
                    recentReports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white text-sm font-medium">
                              {report.report_type.replace('_', ' ').toUpperCase()}
                            </span>
                            <Badge className={getStatusColor(report.status)}>
                              {report.status}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-xs mt-1">
                            {report.client_email} • {new Date(report.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`text-sm font-bold ${getSeverityColor(report.severity_level)}`}>
                          Level {report.severity_level}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-4">No reports yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Safety Alerts */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Safety Alerts
                </CardTitle>
                <CardDescription>Important safety notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {safetyAlerts.length > 0 ? (
                    safetyAlerts.map((alert) => (
                      <div key={alert.id} className="p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-red-300 font-medium text-sm">{alert.title}</h4>
                            <p className="text-red-200/70 text-xs mt-1 line-clamp-2">{alert.message}</p>
                          </div>
                          <div className={`text-xs font-bold ${getSeverityColor(alert.severity_level)}`}>
                            L{alert.severity_level}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-4">No active alerts</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">My Incident Reports</CardTitle>
              <CardDescription>
                View and manage all your incident reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium">
                          {report.report_type.replace('_', ' ').toUpperCase()}
                        </span>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                        <span className={`text-sm font-bold ${getSeverityColor(report.severity_level)}`}>
                          Severity: {report.severity_level}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        Client: {report.client_email}
                      </p>
                      <p className="text-gray-500 text-xs">
                        Reported: {new Date(report.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {recentReports.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No reports submitted yet</p>
                    <Button
                      onClick={() => setShowReportForm(true)}
                      className="mt-4 brand-gradient"
                    >
                      Submit Your First Report
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checkin">
          <LocationCheckIn onCheckIn={loadSafetyData} />
        </TabsContent>

        <TabsContent value="alerts">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Safety Alerts</CardTitle>
              <CardDescription>
                Stay informed about safety concerns in your area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {safetyAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-red-300 font-semibold">{alert.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${getSeverityColor(alert.severity_level)}`}>
                          Level {alert.severity_level}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {new Date(alert.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-red-200/80 text-sm">{alert.message}</p>
                  </div>
                ))}
                {safetyAlerts.length === 0 && (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No active safety alerts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <SafetyPreferencesForm />
        </TabsContent>
      </Tabs>

      {/* Report Incident Modal */}
      {showReportForm && (
        <ReportIncidentForm
          onClose={() => setShowReportForm(false)}
          onSubmit={() => {
            setShowReportForm(false);
            loadSafetyData();
          }}
        />
      )}
    </div>
  );
}