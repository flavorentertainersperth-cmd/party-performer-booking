"use client";
import React, { useEffect, useState } from 'react';

interface Booking {
  id: string;
  event_datetime: string;
  booking_status: string;
  payment_status: string;
  deposit_amount: number;
}
interface Referral {
  id: string;
  fee: number;
  status: string;
  paid_at: string | null;
}

export default function PerformerDashboard() {
  const [availability, setAvailability] = useState<'available' | 'unavailable'>('unavailable');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  // Fetch performer availability on mount
  useEffect(() => {
    async function fetchData() {
      const [bookingsRes, referralsRes] = await Promise.all([
        fetch('/api/bookings', { cache: 'no-store' }),
        fetch('/api/referrals', { cache: 'no-store' })
      ]);
      const bookingsData = await bookingsRes.json();
      const referralsData = await referralsRes.json();
      setBookings(bookingsData);
      setReferrals(referralsData);
      // Also fetch performer record to get current availability
      const perfRes = await fetch('/api/performers');
      const perfData = await perfRes.json();
      // Determine current user performer record (first one due to RLS)
      if (perfData && perfData.length > 0) {
        setAvailability(perfData[0].availability_status);
      }
    }
    fetchData();
  }, []);

  const toggleAvailability = async () => {
    const newStatus = availability === 'available' ? 'unavailable' : 'available';
    setLoading(true);
    try {
      const res = await fetch('/api/performers/availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availabilityStatus: newStatus })
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Failed to update availability');
      } else {
        setAvailability(data.availability_status);
        setMessage('Availability updated');
      }
    } catch (err) {
      setMessage('Error updating availability');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (bookingId: string, decision: 'approved' | 'declined') => {
    try {
      setLoading(true);
      const res = await fetch('/api/bookings/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, decision })
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Failed to update booking');
      } else {
        setMessage('Booking updated');
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, booking_status: decision } : b)));
      }
    } catch (err) {
      setMessage('Error updating booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <h1>Performer Dashboard</h1>
      {message && <p>{message}</p>}
      <section>
        <h2>Availability</h2>
        <p>Current status: <span className={`pill ${availability}`}>{availability}</span></p>
        <button className="button" onClick={toggleAvailability} disabled={loading}>Toggle Availability</button>
      </section>
      <section style={{ marginTop: '2rem' }}>
        <h2>Upcoming Bookings</h2>
        {bookings.length === 0 ? <p>No bookings found.</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem' }}>Booking ID</th>
                <th style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem' }}>Event</th>
                <th style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem' }}>Status</th>
                <th style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.5rem' }}>{b.id}</td>
                  <td style={{ padding: '0.5rem' }}>{new Date(b.event_datetime).toLocaleString()}</td>
                  <td style={{ padding: '0.5rem' }}>{b.booking_status}</td>
                  <td style={{ padding: '0.5rem' }}>
                    {b.booking_status === 'pending' ? (
                      <>
                        <button className="button" style={{ marginRight: '0.5rem' }} disabled={loading} onClick={() => handleDecision(b.id, 'approved')}>Approve</button>
                        <button className="button" disabled={loading} onClick={() => handleDecision(b.id, 'declined')}>Decline</button>
                      </>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <section style={{ marginTop: '2rem' }}>
        <h2>Referrals</h2>
        {referrals.length === 0 ? <p>No referrals found.</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem' }}>Referral ID</th>
                <th style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem' }}>Fee</th>
                <th style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.5rem' }}>{r.id}</td>
                  <td style={{ padding: '0.5rem' }}>${r.override_fee || r.fee}</td>
                  <td style={{ padding: '0.5rem' }}>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}