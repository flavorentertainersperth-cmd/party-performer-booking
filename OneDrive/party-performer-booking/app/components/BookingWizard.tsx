"use client";
import React, { useEffect, useState } from 'react';

interface Performer {
  id: string;
  stage_name: string;
  availability_status: 'available' | 'unavailable';
}
interface Service {
  id: string;
  name: string;
  rate: number;
  unit: string;
}

export default function BookingWizard({ defaultPerformerId }: { defaultPerformerId?: string } = {}) {
  const [step, setStep] = useState<number>(0);
  const [eventDatetime, setEventDatetime] = useState('');
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedPerformer, setSelectedPerformer] = useState<string>(defaultPerformerId ?? '');
  const [selectedService, setSelectedService] = useState<string>('');
  const [bookingId, setBookingId] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const depositPercentage = Number(process.env.NEXT_PUBLIC_DEPOSIT_PERCENTAGE ?? '30');
  const payIdName = process.env.NEXT_PUBLIC_PAYID_NAME || 'Party Performers';
  const payIdIdentifier = process.env.NEXT_PUBLIC_PAYID_IDENTIFIER || 'bookings@example.payid.au';

  useEffect(() => {
    // fetch performers on mount
    async function fetchData() {
      const res = await fetch('/api/performers');
      const data = await res.json();
      setPerformers(data);
      const sres = await fetch('/api/services');
      const sdata = await sres.json();
      setServices(sdata);
    }
    fetchData();
  }, []);

  const handleNext = async () => {
    if (step === 0) {
      if (!eventDatetime) return alert('Please select an event date and time.');
      setStep(1);
    } else if (step === 1) {
      if (!selectedPerformer) return alert('Please select a performer.');
      setStep(2);
    } else if (step === 2) {
      if (!selectedService) return alert('Please select a service.');
      // Create booking before payment
      try {
        setSubmitting(true);
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            performerId: selectedPerformer,
            serviceId: selectedService,
            eventDatetime
          })
        });
        if (!res.ok) {
          const err = await res.json();
          alert(err.error || 'Failed to create booking');
          setSubmitting(false);
          return;
        }
        const data = await res.json();
        setBookingId(data.id);
        setStep(3);
        setSubmitting(false);
      } catch (err) {
        console.error(err);
        alert('Failed to create booking');
        setSubmitting(false);
      }
    } else if (step === 3) {
      if (!receiptUrl) return alert('Please enter your receipt URL');
      try {
        setSubmitting(true);
        const res = await fetch('/api/payid/receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, receiptUrl })
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'Failed to upload receipt');
          setSubmitting(false);
          return;
        }
        alert('Receipt submitted! An admin will verify your deposit.');
        setSubmitting(false);
        setStep(0);
        setEventDatetime('');
        setSelectedPerformer('');
        setSelectedService('');
        setReceiptUrl('');
        setBookingId('');
      } catch (err) {
        console.error(err);
        alert('Error uploading receipt');
        setSubmitting(false);
      }
    }
  };

  const currentService = services.find((s) => s.id === selectedService);
  const depositAmount = currentService ? ((currentService.rate * depositPercentage) / 100).toFixed(2) : '0.00';

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', background: '#fff' }}>
      {step === 0 && (
        <div>
          <h2>Step 1: Event Details</h2>
          <label htmlFor="eventDatetime">Event date & time</label>
          <input
            type="datetime-local"
            id="eventDatetime"
            value={eventDatetime}
            onChange={(e) => setEventDatetime(e.target.value)}
            style={{ display: 'block', marginTop: '0.5rem', marginBottom: '1rem' }}
          />
          <button className="button" onClick={handleNext}>Next</button>
        </div>
      )}
      {step === 1 && (
        <div>
          <h2>Step 2: Choose Performer</h2>
          <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e5e7eb', padding: '0.5rem' }}>
            {performers.map((p) => (
              <div key={p.id} style={{ marginBottom: '0.5rem' }}>
                <label>
                  <input
                    type="radio"
                    name="performer"
                    value={p.id}
                    checked={selectedPerformer === p.id}
                    disabled={p.availability_status !== 'available'}
                    onChange={() => setSelectedPerformer(p.id)}
                  />
                  <span style={{ marginLeft: '0.5rem' }}>{p.stage_name} ({p.availability_status})</span>
                </label>
              </div>
            ))}
          </div>
          <button className="button" onClick={() => setStep(0)} style={{ marginRight: '0.5rem' }}>Back</button>
          <button className="button" onClick={handleNext}>Next</button>
        </div>
      )}
      {step === 2 && (
        <div>
          <h2>Step 3: Choose Service</h2>
          <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e5e7eb', padding: '0.5rem' }}>
            {services.map((s) => (
              <div key={s.id} style={{ marginBottom: '0.5rem' }}>
                <label>
                  <input
                    type="radio"
                    name="service"
                    value={s.id}
                    checked={selectedService === s.id}
                    onChange={() => setSelectedService(s.id)}
                  />
                  <span style={{ marginLeft: '0.5rem' }}>{s.name} (${s.rate}/{s.unit})</span>
                </label>
              </div>
            ))}
          </div>
          <button className="button" onClick={() => setStep(1)} style={{ marginRight: '0.5rem' }}>Back</button>
          <button className="button" onClick={handleNext} disabled={submitting}>Next</button>
        </div>
      )}
      {step === 3 && (
        <div>
          <h2>Step 4: Payment & Deposit</h2>
          <p>Your booking has been created. Please pay the deposit to confirm.</p>
          <p>
            <strong>PayID Name:</strong> {payIdName}
          </p>
          <p>
            <strong>PayID Identifier:</strong> {payIdIdentifier}
          </p>
          <p>
            <strong>Deposit Amount:</strong> ${depositAmount}
          </p>
          <label htmlFor="receiptUrl">Receipt URL</label>
          <input
            type="url"
            id="receiptUrl"
            placeholder="https://..."
            value={receiptUrl}
            onChange={(e) => setReceiptUrl(e.target.value)}
            style={{ display: 'block', marginTop: '0.5rem', marginBottom: '1rem', width: '100%' }}
          />
          <button className="button" onClick={() => setStep(2)} style={{ marginRight: '0.5rem' }} disabled={submitting}>Back</button>
          <button className="button" onClick={handleNext} disabled={submitting}>Submit Receipt</button>
        </div>
      )}
    </div>
  );
}