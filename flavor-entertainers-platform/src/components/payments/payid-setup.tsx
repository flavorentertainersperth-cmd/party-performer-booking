'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Plus,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Building,
  DollarSign,
  Loader2
} from 'lucide-react';
import type { Database } from '@/lib/types/database';

interface PayIDAccount {
  id: string;
  payid_identifier: string;
  payid_type: 'email' | 'mobile';
  account_name: string;
  bank_name?: string;
  bsb?: string;
  account_number?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

interface PayIDSetupProps {
  onSetupComplete?: () => void;
}

export function PayIDSetup({ onSetupComplete }: PayIDSetupProps) {
  const [accounts, setAccounts] = useState<PayIDAccount[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    payidIdentifier: '',
    payidType: 'email' as 'email' | 'mobile',
    accountName: '',
    bankName: '',
    bsb: '',
    accountNumber: ''
  });
  const [showAccountDetails, setShowAccountDetails] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    loadPayIDAccounts();
  }, []);

  const loadPayIDAccounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: accounts } = await supabase
        .from('payid_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      setAccounts(accounts || []);
    } catch (error) {
      console.error('Error loading PayID accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validatePayID = async (identifier: string) => {
    setIsValidating(true);
    try {
      const response = await fetch('/api/payments/payid/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payidIdentifier: identifier })
      });

      const result = await response.json();
      setValidationResult(result);
    } catch (error) {
      console.error('Error validating PayID:', error);
      setValidationResult({ success: false, error: 'Validation failed' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleIdentifierChange = (value: string) => {
    setFormData(prev => ({ ...prev, payidIdentifier: value }));
    setValidationResult(null);

    // Auto-detect type
    if (value.includes('@')) {
      setFormData(prev => ({ ...prev, payidType: 'email' }));
    } else if (/^(\+61|0)[0-9]/.test(value)) {
      setFormData(prev => ({ ...prev, payidType: 'mobile' }));
    }

    // Auto-validate if identifier looks complete
    if ((value.includes('@') && value.includes('.')) ||
        /^(\+61|0)[0-9]{9}$/.test(value.replace(/\s/g, ''))) {
      validatePayID(value);
    }
  };

  const handleSubmit = async () => {
    if (!formData.payidIdentifier || !formData.accountName) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('payid_accounts')
        .insert({
          user_id: user.id,
          payid_identifier: formData.payidIdentifier,
          payid_type: formData.payidType,
          account_name: formData.accountName,
          bank_name: formData.bankName || null,
          bsb: formData.bsb || null,
          account_number: formData.accountNumber || null,
          is_verified: false,
          is_active: true
        });

      if (error) throw error;

      // Reset form
      setFormData({
        payidIdentifier: '',
        payidType: 'email',
        accountName: '',
        bankName: '',
        bsb: '',
        accountNumber: ''
      });
      setValidationResult(null);
      setShowAddForm(false);

      // Reload accounts
      await loadPayIDAccounts();
      onSetupComplete?.();

    } catch (error: any) {
      console.error('Error creating PayID account:', error);
      alert(error.message || 'Failed to create PayID account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAccountDetails = (accountId: string) => {
    setShowAccountDetails(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const formatPayIDType = (type: string) => {
    return type === 'email' ? 'Email' : 'Mobile';
  };

  const formatBSB = (bsb: string) => {
    return bsb?.replace(/(\d{3})(\d{3})/, '$1-$2');
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-6 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p className="text-gray-400">Loading PayID accounts...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">PayID Accounts</h2>
          <p className="text-gray-400">
            Manage your PayID accounts for receiving payments
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="brand-gradient"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add PayID
        </Button>
      </div>

      {/* Existing Accounts */}
      {accounts.length > 0 ? (
        <div className="space-y-4">
          {accounts.map((account) => (
            <Card key={account.id} className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      account.payid_type === 'email'
                        ? 'bg-blue-900/30'
                        : 'bg-green-900/30'
                    }`}>
                      {account.payid_type === 'email' ? (
                        <Mail className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Phone className="w-5 h-5 text-green-400" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-medium">{account.account_name}</h3>
                        <Badge className={
                          account.is_verified
                            ? "bg-green-900/30 text-green-300 border-green-700/50"
                            : "bg-yellow-900/30 text-yellow-300 border-yellow-700/50"
                        }>
                          {account.is_verified ? 'Verified' : 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm">{account.payid_identifier}</p>
                      <p className="text-gray-500 text-xs">
                        {formatPayIDType(account.payid_type)} • Added {new Date(account.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAccountDetails(account.id)}
                      className="text-gray-400 hover:text-white"
                    >
                      {showAccountDetails[account.id] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {showAccountDetails[account.id] && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {account.bank_name && (
                        <div>
                          <span className="text-gray-400">Bank:</span>
                          <span className="text-white ml-2">{account.bank_name}</span>
                        </div>
                      )}
                      {account.bsb && (
                        <div>
                          <span className="text-gray-400">BSB:</span>
                          <span className="text-white ml-2">{formatBSB(account.bsb)}</span>
                        </div>
                      )}
                      {account.account_number && (
                        <div>
                          <span className="text-gray-400">Account:</span>
                          <span className="text-white ml-2">***{account.account_number.slice(-4)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-8 text-center">
            <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">No PayID Accounts</h3>
            <p className="text-gray-400 mb-4">
              Set up your PayID to start receiving payments from clients
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="brand-gradient"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First PayID
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add PayID Form Modal */}
      {showAddForm && (
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="max-w-lg bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Add PayID Account</DialogTitle>
              <DialogDescription>
                Connect your bank account with PayID for instant payments
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* PayID Identifier */}
              <div>
                <Label htmlFor="payidIdentifier" className="text-white">
                  PayID (Email or Mobile) *
                </Label>
                <Input
                  id="payidIdentifier"
                  value={formData.payidIdentifier}
                  onChange={(e) => handleIdentifierChange(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="your.email@example.com or +61400000000"
                />

                {isValidating && (
                  <div className="flex items-center text-blue-400 text-sm mt-1">
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    Validating PayID...
                  </div>
                )}

                {validationResult && (
                  <div className={`flex items-center text-sm mt-1 ${
                    validationResult.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {validationResult.success ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 mr-1" />
                    )}
                    {validationResult.success
                      ? `Valid PayID: ${validationResult.accountName}`
                      : validationResult.error || 'Invalid PayID'
                    }
                  </div>
                )}
              </div>

              {/* PayID Type */}
              <div>
                <Label className="text-white">Type</Label>
                <Select
                  value={formData.payidType}
                  onValueChange={(value: 'email' | 'mobile') =>
                    setFormData(prev => ({ ...prev, payidType: value }))
                  }
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="email">Email Address</SelectItem>
                    <SelectItem value="mobile">Mobile Number</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Account Name */}
              <div>
                <Label htmlFor="accountName" className="text-white">
                  Account Name *
                </Label>
                <Input
                  id="accountName"
                  value={formData.accountName}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="As shown on your bank account"
                />
              </div>

              {/* Optional Bank Details */}
              <div className="space-y-3">
                <Label className="text-white text-sm">
                  Bank Details (Optional)
                </Label>

                <Input
                  value={formData.bankName}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Bank name"
                />

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={formData.bsb}
                    onChange={(e) => setFormData(prev => ({ ...prev, bsb: e.target.value }))}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="BSB"
                    maxLength={6}
                  />
                  <Input
                    value={formData.accountNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Account number"
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
                <div className="flex items-start">
                  <Building className="w-4 h-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-blue-300 text-sm font-medium mb-1">PayID Information</p>
                    <p className="text-blue-200/80 text-xs">
                      PayID allows clients to pay you instantly using just your email or mobile number.
                      Your PayID must be registered with your bank first.
                    </p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.payidIdentifier || !formData.accountName}
                  className="flex-1 brand-gradient"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Add PayID
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}