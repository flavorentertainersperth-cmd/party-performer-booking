import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';

// Initialize Supabase client for service-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

export interface PayIDAccount {
  id: string;
  user_id: string;
  payid_identifier: string;
  payid_type: 'email' | 'mobile';
  account_name: string;
  bank_name?: string;
  bsb?: string;
  account_number?: string;
  is_verified: boolean;
  is_active: boolean;
}

export interface PaymentRequest {
  id: string;
  booking_id: string;
  payer_id: string;
  recipient_id: string;
  amount: number;
  currency: string;
  payid_identifier: string;
  status: string;
  due_date: string;
  payment_date?: string;
}

export interface CreatePaymentParams {
  bookingId: string;
  payerId: string;
  recipientId: string;
  amount: number;
  description?: string;
  dueDate?: Date;
}

export interface PayIDValidationResult {
  isValid: boolean;
  accountName?: string;
  bankName?: string;
  error?: string;
}

/**
 * Create a PayID account for a user
 */
export async function createPayIDAccount(
  userId: string,
  payidIdentifier: string,
  accountName: string,
  bankName?: string,
  bsb?: string,
  accountNumber?: string
): Promise<{ success: boolean; account?: PayIDAccount; error?: string }> {
  try {
    // Determine PayID type
    const payidType = payidIdentifier.includes('@') ? 'email' : 'mobile';

    // Validate PayID format
    if (payidType === 'email' && !isValidEmail(payidIdentifier)) {
      return { success: false, error: 'Invalid email format' };
    }

    if (payidType === 'mobile' && !isValidMobileNumber(payidIdentifier)) {
      return { success: false, error: 'Invalid mobile number format' };
    }

    // Check if PayID already exists
    const { data: existing } = await supabase
      .from('payid_accounts')
      .select('id')
      .eq('payid_identifier', payidIdentifier)
      .eq('is_active', true)
      .single();

    if (existing) {
      return { success: false, error: 'PayID already registered' };
    }

    // Create PayID account
    const { data: account, error } = await supabase
      .from('payid_accounts')
      .insert({
        user_id: userId,
        payid_identifier: payidIdentifier,
        payid_type: payidType,
        account_name: accountName,
        bank_name: bankName || null,
        bsb: bsb || null,
        account_number: accountNumber || null,
        is_verified: false, // Will be verified through external process
        is_active: true
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, account: account as PayIDAccount };

  } catch (error: any) {
    console.error('Error creating PayID account:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Validate PayID identifier with NPP (mock implementation)
 */
export async function validatePayID(payidIdentifier: string): Promise<PayIDValidationResult> {
  try {
    // In a real implementation, this would call the NPP PayID resolution service
    // For now, we'll simulate validation based on format

    const isEmail = payidIdentifier.includes('@');
    const isMobile = /^(\+61|0)[0-9]{9}$/.test(payidIdentifier.replace(/\s/g, ''));

    if (!isEmail && !isMobile) {
      return {
        isValid: false,
        error: 'Invalid PayID format. Must be email or mobile number.'
      };
    }

    // Mock successful validation
    return {
      isValid: true,
      accountName: 'Mock Account Name',
      bankName: 'Mock Bank'
    };

  } catch (error: any) {
    return {
      isValid: false,
      error: error.message
    };
  }
}

/**
 * Create a payment request
 */
export async function createPaymentRequest({
  bookingId,
  payerId,
  recipientId,
  amount,
  description,
  dueDate
}: CreatePaymentParams): Promise<{ success: boolean; paymentId?: string; error?: string }> {
  try {
    // Get recipient's PayID account
    const { data: payidAccount } = await supabase
      .from('payid_accounts')
      .select('*')
      .eq('user_id', recipientId)
      .eq('is_active', true)
      .single();

    if (!payidAccount) {
      return { success: false, error: 'Recipient has no active PayID account' };
    }

    // Calculate fees and net amount
    const feeRate = 0.025; // 2.5% fee
    const feeAmount = Math.round(amount * feeRate * 100) / 100;
    const netAmount = amount - feeAmount;

    // Create payment transaction
    const { data: payment, error } = await supabase
      .from('payment_transactions')
      .insert({
        booking_id: bookingId,
        payer_id: payerId,
        recipient_id: recipientId,
        payment_method: 'payid',
        amount: amount,
        currency: 'AUD',
        payid_identifier: payidAccount.payid_identifier,
        payid_name: payidAccount.account_name,
        fee_amount: feeAmount,
        net_amount: netAmount,
        status: 'pending',
        description: description || `Payment for booking ${bookingId}`,
        due_date: dueDate?.toISOString() || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, paymentId: payment.id };

  } catch (error: any) {
    console.error('Error creating payment request:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get payment status
 */
export async function getPaymentStatus(paymentId: string): Promise<{ payment?: any; error?: string }> {
  try {
    const { data: payment, error } = await supabase
      .from('payment_transactions')
      .select(`
        *,
        booking:bookings(*),
        payer:users!payment_transactions_payer_id_fkey(id, email, full_name),
        recipient:users!payment_transactions_recipient_id_fkey(id, email, full_name)
      `)
      .eq('id', paymentId)
      .single();

    if (error) {
      return { error: error.message };
    }

    return { payment };

  } catch (error: any) {
    console.error('Error getting payment status:', error);
    return { error: error.message };
  }
}

/**
 * Update payment status (called by webhook or manual update)
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: string,
  externalTransactionId?: string,
  paymentDate?: Date,
  failureReason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (externalTransactionId) {
      updateData.external_transaction_id = externalTransactionId;
    }

    if (paymentDate) {
      updateData.payment_date = paymentDate.toISOString();
    }

    if (failureReason) {
      updateData.failure_reason = failureReason;
    }

    const { error } = await supabase
      .from('payment_transactions')
      .update(updateData)
      .eq('id', paymentId);

    if (error) {
      return { success: false, error: error.message };
    }

    // If payment completed, update booking status and send notifications
    if (status === 'completed') {
      await handlePaymentCompleted(paymentId);
    }

    return { success: true };

  } catch (error: any) {
    console.error('Error updating payment status:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle completed payment workflow
 */
async function handlePaymentCompleted(paymentId: string) {
  try {
    // Get payment details
    const { payment } = await getPaymentStatus(paymentId);
    if (!payment) return;

    // Update booking status to confirmed
    await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.booking_id);

    // Send confirmation notifications (integrate with Twilio service)
    // This would typically send SMS/WhatsApp confirmations to both client and performer

  } catch (error) {
    console.error('Error handling payment completion:', error);
  }
}

/**
 * Get user's PayID accounts
 */
export async function getUserPayIDAccounts(userId: string): Promise<PayIDAccount[]> {
  try {
    const { data: accounts } = await supabase
      .from('payid_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    return accounts || [];

  } catch (error) {
    console.error('Error getting user PayID accounts:', error);
    return [];
  }
}

/**
 * Get payment history for user
 */
export async function getUserPaymentHistory(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ payments: any[]; total: number }> {
  try {
    // Get payments where user is either payer or recipient
    const { data: payments, error } = await supabase
      .from('payment_transactions')
      .select(`
        *,
        booking:bookings(id, event_date, event_time, client_name, performer_name),
        payer:users!payment_transactions_payer_id_fkey(id, email, full_name),
        recipient:users!payment_transactions_recipient_id_fkey(id, email, full_name)
      `)
      .or(`payer_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Get total count
    const { count } = await supabase
      .from('payment_transactions')
      .select('id', { count: 'exact', head: true })
      .or(`payer_id.eq.${userId},recipient_id.eq.${userId}`);

    return {
      payments: payments || [],
      total: count || 0
    };

  } catch (error) {
    console.error('Error getting payment history:', error);
    return { payments: [], total: 0 };
  }
}

/**
 * Generate payment instructions for PayID
 */
export function generatePaymentInstructions(
  payidIdentifier: string,
  amount: number,
  reference: string,
  accountName?: string
): string {
  return `
Payment Instructions:

1. Open your banking app or online banking
2. Select "Pay Someone" or "New Payment"
3. Enter PayID: ${payidIdentifier}
${accountName ? `4. Verify account name: ${accountName}` : '4. Verify the account name matches the booking'}
5. Amount: $${amount.toFixed(2)} AUD
6. Reference: ${reference}
7. Complete the payment

Your booking will be confirmed once payment is received.
`.trim();
}

// Helper functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidMobileNumber(mobile: string): boolean {
  // Australian mobile number format
  const mobileRegex = /^(\+61|0)[0-9]{9}$/;
  return mobileRegex.test(mobile.replace(/\s/g, ''));
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'AUD'): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Calculate payment fees
 */
export function calculatePaymentFees(amount: number, method: string = 'payid'): {
  feeAmount: number;
  netAmount: number;
  feePercentage: number;
} {
  let feePercentage = 0;

  switch (method) {
    case 'payid':
      feePercentage = 0.025; // 2.5%
      break;
    case 'credit_card':
      feePercentage = 0.029; // 2.9%
      break;
    case 'bank_transfer':
      feePercentage = 0.01; // 1.0%
      break;
    default:
      feePercentage = 0.025;
  }

  const feeAmount = Math.round(amount * feePercentage * 100) / 100;
  const netAmount = amount - feeAmount;

  return {
    feeAmount,
    netAmount,
    feePercentage: feePercentage * 100
  };
}