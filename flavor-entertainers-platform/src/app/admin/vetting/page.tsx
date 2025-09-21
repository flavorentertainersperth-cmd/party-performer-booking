'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  Download,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Star
} from 'lucide-react';
import type { Database } from '@/lib/types/database';

type VettingApplication = Database['public']['Tables']['vetting_applications']['Row'];
type ApplicationStatus = Database['public']['Enums']['application_status'];

interface VettingApplicationWithUser extends VettingApplication {
  user?: {
    email: string;
    first_name: string;
    last_name: string;
    profile_picture_url: string;
  };
}

export default function VettingPage() {
  const [applications, setApplications] = useState<VettingApplicationWithUser[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<VettingApplicationWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedApplication, setSelectedApplication] = useState<VettingApplicationWithUser | null>(null);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const supabase = createClientComponentClient<Database>();

  const fetchApplications = async () => {
    try {
      setIsLoading(true);

      const { data: applicationsData, error } = await supabase
        .from('vetting_applications')
        .select(`
          *,
          user:users!vetting_applications_user_id_fkey(email, first_name, last_name, profile_picture_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setApplications(applicationsData || []);
      setFilteredApplications(applicationsData || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    let filtered = applications;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.performance_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  }, [applications, searchTerm, statusFilter]);

  const getStatusBadgeColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50';
      case 'needs_review': return 'bg-orange-900/30 text-orange-300 border-orange-700/50';
      case 'approved': return 'bg-green-900/30 text-green-300 border-green-700/50';
      case 'rejected': return 'bg-red-900/30 text-red-300 border-red-700/50';
      case 'expired': return 'bg-gray-900/30 text-gray-300 border-gray-700/50';
      default: return 'bg-gray-900/30 text-gray-300 border-gray-700/50';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleApplicationAction = async (action: 'approve' | 'reject', application: VettingApplicationWithUser) => {
    try {
      const updateData: any = {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewer_id: (await supabase.auth.getUser()).data.user?.id
      };

      if (action === 'approve') {
        updateData.approval_notes = reviewNotes;
      } else {
        updateData.rejection_reason = reviewNotes;
      }

      const { error: updateError } = await supabase
        .from('vetting_applications')
        .update(updateData)
        .eq('id', application.id);

      if (updateError) throw updateError;

      // If approved, create performer profile
      if (action === 'approve') {
        const { error: performerError } = await supabase
          .from('performers')
          .insert({
            application_id: application.id,
            user_id: application.user_id,
            stage_name: application.full_name,
            bio: `Professional ${application.performance_type} performer from ${application.location}`,
            performance_types: [application.performance_type],
            service_areas: [application.location],
            verified: true,
            featured: false
          });

        if (performerError) throw performerError;

        // Update user role to performer
        const { error: roleError } = await supabase
          .from('users')
          .update({ role: 'performer' })
          .eq('id', application.user_id);

        if (roleError) throw roleError;
      }

      setShowApplicationDialog(false);
      setReviewNotes('');
      setReviewAction(null);
      fetchApplications();
    } catch (error) {
      console.error('Error processing application:', error);
    }
  };

  const getApplicationStats = () => {
    const stats = {
      total: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      needs_review: applications.filter(a => a.status === 'needs_review').length,
      approved: applications.filter(a => a.status === 'approved').length,
      rejected: applications.filter(a => a.status === 'rejected').length
    };
    return stats;
  };

  const stats = getApplicationStats();

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
          <h1 className="text-3xl font-bold text-white">Performer Vetting</h1>
          <p className="text-gray-400 mt-1">
            Review and approve performer applications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={fetchApplications}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <p className="text-xs text-gray-400">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-900/20 border-yellow-700/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-300">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            <p className="text-xs text-yellow-300/70">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-900/20 border-orange-700/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-300">Needs Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">{stats.needs_review}</div>
            <p className="text-xs text-orange-300/70">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="bg-green-900/20 border-green-700/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-300">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
            <p className="text-xs text-green-300/70">Successful applications</p>
          </CardContent>
        </Card>

        <Card className="bg-red-900/20 border-red-700/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-300">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
            <p className="text-xs text-red-300/70">Did not meet criteria</p>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Applications</CardTitle>
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-700 text-white w-64"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('pending')}
                  className={statusFilter === 'pending' ? 'bg-yellow-600' : 'border-gray-600 text-gray-300'}
                >
                  Pending ({stats.pending})
                </Button>
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                  className={statusFilter === 'all' ? 'bg-purple-600' : 'border-gray-600 text-gray-300'}
                >
                  All
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Applicant</TableHead>
                <TableHead className="text-gray-300">Performance Type</TableHead>
                <TableHead className="text-gray-300">Experience</TableHead>
                <TableHead className="text-gray-300">Location</TableHead>
                <TableHead className="text-gray-300">Age</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Applied</TableHead>
                <TableHead className="text-gray-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((application) => (
                <TableRow key={application.id} className="border-gray-700 hover:bg-gray-800/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {application.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-white">{application.full_name}</div>
                        <div className="text-sm text-gray-400">{application.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {application.performance_type}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {application.experience_years} years
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {application.location}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {calculateAge(application.date_of_birth)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(application.status as ApplicationStatus)}>
                      {application.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {formatDate(application.created_at || '')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() => {
                        setSelectedApplication(application);
                        setShowApplicationDialog(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Application Review Dialog */}
      <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle>Application Review</DialogTitle>
            <DialogDescription className="text-gray-400">
              Review performer application for {selectedApplication?.full_name}
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Full Name</Label>
                      <p className="text-white">{selectedApplication.full_name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Email</Label>
                      <p className="text-white">{selectedApplication.email}</p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Phone</Label>
                      <p className="text-white">{selectedApplication.phone}</p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Date of Birth</Label>
                      <p className="text-white">
                        {formatDate(selectedApplication.date_of_birth)}
                        <span className="text-gray-400 ml-2">
                          (Age: {calculateAge(selectedApplication.date_of_birth)})
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Location</Label>
                      <p className="text-white">{selectedApplication.location}</p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Performance Type</Label>
                      <p className="text-white">{selectedApplication.performance_type}</p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Experience</Label>
                      <p className="text-white">{selectedApplication.experience_years} years</p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Application Status</Label>
                      <Badge className={getStatusBadgeColor(selectedApplication.status as ApplicationStatus)}>
                        {selectedApplication.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="experience" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Portfolio URLs</Label>
                    <div className="mt-2 space-y-2">
                      {selectedApplication.portfolio_urls &&
                       (selectedApplication.portfolio_urls as string[]).length > 0 ? (
                        (selectedApplication.portfolio_urls as string[]).map((url, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline"
                            >
                              {url}
                            </a>
                            <Button variant="ghost" size="sm" className="text-gray-400">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400">No portfolio URLs provided</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300">Background Check Status</Label>
                    <p className="text-white">{selectedApplication.background_check_status || 'Pending'}</p>
                  </div>

                  {selectedApplication.approval_notes && (
                    <div>
                      <Label className="text-gray-300">Previous Approval Notes</Label>
                      <p className="text-white">{selectedApplication.approval_notes}</p>
                    </div>
                  )}

                  {selectedApplication.rejection_reason && (
                    <div>
                      <Label className="text-gray-300">Previous Rejection Reason</Label>
                      <p className="text-red-400">{selectedApplication.rejection_reason}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <div>
                  <Label className="text-gray-300">Uploaded Documents</Label>
                  <div className="mt-2 space-y-2">
                    {selectedApplication.documents &&
                     Object.keys(selectedApplication.documents as object).length > 0 ? (
                      Object.entries(selectedApplication.documents as object).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                          <span className="text-white">{key.replace('_', ' ').toUpperCase()}</span>
                          <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400">No documents uploaded</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Review Section */}
          {selectedApplication?.status === 'pending' && (
            <div className="border-t border-gray-700 pt-4 mt-4">
              <Label className="text-gray-300">Review Notes</Label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add your review notes here..."
                className="mt-2 bg-gray-800/50 border-gray-700 text-white"
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowApplicationDialog(false);
                setReviewNotes('');
                setReviewAction(null);
              }}
              className="border-gray-600 text-gray-300"
            >
              Close
            </Button>
            {selectedApplication?.status === 'pending' && (
              <>
                <Button
                  onClick={() => handleApplicationAction('reject', selectedApplication)}
                  variant="outline"
                  className="border-red-600 text-red-400 hover:bg-red-900/20"
                  disabled={!reviewNotes.trim()}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApplicationAction('approve', selectedApplication)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={!reviewNotes.trim()}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}