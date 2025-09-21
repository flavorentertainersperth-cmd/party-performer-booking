'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  Shield,
  FileText,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Upload,
  X,
  Clock
} from 'lucide-react';
import type { Database } from '@/lib/types/database';

interface ReportIncidentFormProps {
  onClose: () => void;
  onSubmit: () => void;
}

interface FormData {
  clientEmail: string;
  clientName: string;
  clientPhone: string;
  reportType: string;
  incidentDate: string;
  incidentTime: string;
  location: string;
  description: string;
  severityLevel: number;
  witnessInfo: string;
  policeReported: boolean;
  policeReportNumber: string;
  medicalAttention: boolean;
  immediateAction: string;
  evidenceFiles: File[];
}

const reportTypes = [
  { value: 'inappropriate_behavior', label: 'Inappropriate Behavior', description: 'Unwanted advances, comments, or actions' },
  { value: 'non_payment', label: 'Non-Payment', description: 'Client failed to pay agreed amount' },
  { value: 'safety_concern', label: 'Safety Concern', description: 'Situations that made you feel unsafe' },
  { value: 'harassment', label: 'Harassment', description: 'Verbal or physical harassment' },
  { value: 'boundary_violation', label: 'Boundary Violation', description: 'Client violated agreed boundaries' },
  { value: 'intoxication', label: 'Intoxication', description: 'Client was heavily intoxicated' },
  { value: 'other', label: 'Other', description: 'Other concerning behavior' }
];

const severityLevels = [
  { level: 1, label: 'Minor', color: 'bg-green-900/30 text-green-300', description: 'Uncomfortable but manageable' },
  { level: 2, label: 'Low', color: 'bg-blue-900/30 text-blue-300', description: 'Concerning but not dangerous' },
  { level: 3, label: 'Moderate', color: 'bg-yellow-900/30 text-yellow-300', description: 'Significant concern' },
  { level: 4, label: 'High', color: 'bg-orange-900/30 text-orange-300', description: 'Dangerous situation' },
  { level: 5, label: 'Critical', color: 'bg-red-900/30 text-red-300', description: 'Immediate threat to safety' }
];

export function ReportIncidentForm({ onClose, onSubmit }: ReportIncidentFormProps) {
  const [formData, setFormData] = useState<FormData>({
    clientEmail: '',
    clientName: '',
    clientPhone: '',
    reportType: '',
    incidentDate: '',
    incidentTime: '',
    location: '',
    description: '',
    severityLevel: 3,
    witnessInfo: '',
    policeReported: false,
    policeReportNumber: '',
    medicalAttention: false,
    immediateAction: '',
    evidenceFiles: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const supabase = createClientComponentClient<Database>();

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, evidenceFiles: [...prev.evidenceFiles, ...files] }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      evidenceFiles: prev.evidenceFiles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.clientEmail || !formData.reportType || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create DNS registry entry
      const { error: dnsError } = await supabase
        .from('do_not_serve_registry')
        .insert({
          client_email: formData.clientEmail,
          client_name: formData.clientName || null,
          client_phone: formData.clientPhone || null,
          reported_by: user.id,
          report_type: formData.reportType as any,
          incident_date: formData.incidentDate ?
            new Date(`${formData.incidentDate}T${formData.incidentTime || '00:00'}`).toISOString() :
            new Date().toISOString(),
          description: formData.description,
          severity_level: formData.severityLevel,
          status: 'pending'
        });

      if (dnsError) throw dnsError;

      // Create detailed incident report
      const { error: reportError } = await supabase
        .from('incident_reports')
        .insert({
          reporter_id: user.id,
          incident_type: formData.reportType as any,
          incident_date: formData.incidentDate ?
            new Date(`${formData.incidentDate}T${formData.incidentTime || '00:00'}`).toISOString() :
            new Date().toISOString(),
          location_details: formData.location,
          witness_information: formData.witnessInfo || null,
          description: formData.description,
          police_report_filed: formData.policeReported,
          police_report_number: formData.policeReportNumber || null,
          medical_attention_required: formData.medicalAttention,
          immediate_action_taken: formData.immediateAction || null,
          evidence_files: formData.evidenceFiles.map(f => f.name),
          status: 'pending'
        });

      if (reportError) throw reportError;

      onSubmit();
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const selectedSeverity = severityLevels.find(s => s.level === formData.severityLevel);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
            Report Incident - Step {step} of 3
          </DialogTitle>
          <DialogDescription>
            Report a client for inappropriate behavior or safety concerns. This information will be added to our Do Not Serve registry.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {step === 1 && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Client Information</CardTitle>
                <CardDescription>
                  Provide details about the client involved in the incident
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="clientEmail" className="text-white">
                    Client Email Address *
                  </Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="client@example.com"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientName" className="text-white">
                      Client Name (if known)
                    </Label>
                    <Input
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) => handleInputChange('clientName', e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="clientPhone" className="text-white">
                      Client Phone (if known)
                    </Label>
                    <Input
                      id="clientPhone"
                      type="tel"
                      value={formData.clientPhone}
                      onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="+61 xxx xxx xxx"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white">Report Type *</Label>
                  <Select onValueChange={(value) => handleInputChange('reportType', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select incident type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-gray-400">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Severity Level *</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {severityLevels.map((level) => (
                      <button
                        key={level.level}
                        type="button"
                        onClick={() => handleInputChange('severityLevel', level.level)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          formData.severityLevel === level.level
                            ? `${level.color} border-current`
                            : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        <div className="font-bold text-lg">{level.level}</div>
                        <div className="text-xs">{level.label}</div>
                      </button>
                    ))}
                  </div>
                  {selectedSeverity && (
                    <p className="text-xs text-gray-400 mt-2">{selectedSeverity.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Incident Details</CardTitle>
                <CardDescription>
                  Provide specific information about what happened
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="incidentDate" className="text-white">
                      Incident Date
                    </Label>
                    <Input
                      id="incidentDate"
                      type="date"
                      value={formData.incidentDate}
                      onChange={(e) => handleInputChange('incidentDate', e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="incidentTime" className="text-white">
                      Incident Time
                    </Label>
                    <Input
                      id="incidentTime"
                      type="time"
                      value={formData.incidentTime}
                      onChange={(e) => handleInputChange('incidentTime', e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location" className="text-white">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Venue address or general area"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-white">
                    Incident Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white min-h-[120px]"
                    placeholder="Describe what happened in detail. Include specific behaviors, words used, and any threats made."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="witnessInfo" className="text-white">
                    Witness Information
                  </Label>
                  <Textarea
                    id="witnessInfo"
                    value={formData.witnessInfo}
                    onChange={(e) => handleInputChange('witnessInfo', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Names and contact details of any witnesses"
                  />
                </div>

                <div>
                  <Label htmlFor="immediateAction" className="text-white">
                    Immediate Action Taken
                  </Label>
                  <Textarea
                    id="immediateAction"
                    value={formData.immediateAction}
                    onChange={(e) => handleInputChange('immediateAction', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="What did you do immediately after the incident?"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Additional Information</CardTitle>
                <CardDescription>
                  Optional details and evidence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="policeReported"
                      checked={formData.policeReported}
                      onCheckedChange={(checked) => handleInputChange('policeReported', checked)}
                    />
                    <Label htmlFor="policeReported" className="text-white">
                      Police report filed
                    </Label>
                  </div>

                  {formData.policeReported && (
                    <div>
                      <Label htmlFor="policeReportNumber" className="text-white">
                        Police Report Number
                      </Label>
                      <Input
                        id="policeReportNumber"
                        value={formData.policeReportNumber}
                        onChange={(e) => handleInputChange('policeReportNumber', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="Report reference number"
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="medicalAttention"
                      checked={formData.medicalAttention}
                      onCheckedChange={(checked) => handleInputChange('medicalAttention', checked)}
                    />
                    <Label htmlFor="medicalAttention" className="text-white">
                      Medical attention required
                    </Label>
                  </div>
                </div>

                <div>
                  <Label className="text-white">Evidence Files</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*,audio/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="evidence-upload"
                    />
                    <label
                      htmlFor="evidence-upload"
                      className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors"
                    >
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-300 text-sm">Click to upload evidence files</p>
                        <p className="text-gray-500 text-xs">Images, videos, audio, or PDF files</p>
                      </div>
                    </label>
                  </div>

                  {formData.evidenceFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {formData.evidenceFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                          <span className="text-white text-sm">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-yellow-300 font-medium text-sm mb-1">Important Note</h4>
                      <p className="text-yellow-200/80 text-xs">
                        This report will be reviewed by our safety team and the client will be added to the Do Not Serve registry if verified.
                        False reports may result in account suspension.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <div>
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Previous
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>

              {step < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={step === 1 && (!formData.clientEmail || !formData.reportType)}
                  className="brand-gradient"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.description}
                  className="brand-gradient"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}