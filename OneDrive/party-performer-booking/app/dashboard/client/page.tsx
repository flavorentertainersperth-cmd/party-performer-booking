"use client";
import React, { useEffect, useState } from 'react';

interface Booking {
  id: string;
  event_datetime: string;
  booking_status: string;
  payment_status: string;
  deposit_amount: number;
}

export default function ClientDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/bookings', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Failed to load bookings');
      } else {
        setBookings(data);
      }
    }
    fetchData();
  }, []);

  return (
    <main className="container">
      <h1>Client Dashboard</h1>
      {message && <p>{message}</p>}
      <section>
        <h2>My Bookings</h2>
        {bookings.length === 0 ? <p>No bookings found.</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem' }}>Booking ID</th>
                <th style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem' }}>Event</th>
                <th style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem' }}>Status</th>
                <th style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem' }}>Payment</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.5rem' }}>{b.id}</td>
                  <td style={{ padding: '0.5rem' }}>{new Date(b.event_datetime).toLocaleString()}</td>
                  <td style={{ padding: '0.5rem' }}>{b.booking_status}</td>
                  <td style={{ padding: '0.5rem' }}>{b.payment_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}