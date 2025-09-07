"use client";
import React, { useEffect, useState } from 'react';

interface Booking {
  id: string;
  performer_id: string;
  client_id: string;
  service_id: string;
  event_datetime: string;
  deposit_amount: number;
  payment_status: string;
  deposit_pending_review: boolean;
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [formState, setFormState] = useState<Record<string, { etaMinutes?: number; etaNote?: string; referralOverrideFee?: number }>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    async function fetchBookings() {
      const res = await fetch('/api/bookings?paymentStatus=deposit_pending_review', { cache: 'no-store' });
      const data = await res.json();
      setBookings(data);
    }
    fetchBookings();
  }, []);

  const handleChange = (bookingId: string, field: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [bookingId]: { ...prev[bookingId], [field]: value ? Number(value) : undefined }
    }));
  };

  const handleVerify = async (bookingId: string) => {
    const input = formState[bookingId] || {};
    try {
      setLoading(true);
      const res = await fetch('/api/admin/verify-payid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, ...input })
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(`Error: ${data.error}`);
      } else {
        setMessage('Deposit verified');
        // remove booking from list
        setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      }
    } catch (err: any) {
      setMessage('Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <h1>Admin Dashboard</h1>
      {message && <p>{message}</p>}
      <h2>Pending Deposits</h2>
      {bookings.length === 0 ? (
        <p>No deposits pending review.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem' }}>Booking ID</th>
              <th style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem' }}>Deposit</th>
              <th style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem' }}>ETA (minutes)</th>
              <th style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem' }}>ETA Note</th>
              <th style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem' }}>Referral Override</th>
              <th style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '0.5rem' }}>{b.id}</td>
                <td style={{ padding: '0.5rem' }}>${b.deposit_amount}</td>
                <td style={{ padding: '0.5rem' }}>
                  <input
                    type="number"
                    min={1}
                    placeholder="ETA"
                    value={formState[b.id]?.etaMinutes || ''}
                    onChange={(e) => handleChange(b.id, 'etaMinutes', e.target.value)}
                  />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Note"
                    value={formState[b.id]?.etaNote || ''}
                    onChange={(e) => setFormState((prev) => ({
                      ...prev,
                      [b.id]: { ...prev[b.id], etaNote: e.target.value }
                    }))}
                  />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <input
                    type="number"
                    min={0}
                    placeholder="Override Fee"
                    value={formState[b.id]?.referralOverrideFee || ''}
                    onChange={(e) => handleChange(b.id, 'referralOverrideFee', e.target.value)}
                  />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <button className="button" disabled={loading} onClick={() => handleVerify(b.id)}>
                    Verify
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}