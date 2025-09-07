"use client";
import React, { useEffect, useState } from 'react';

export default function AgeGate({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = useState<boolean>(false);
  const [prompted, setPrompted] = useState<boolean>(false);

  useEffect(() => {
    const accepted = localStorage.getItem('age_gate_accepted');
    if (accepted === 'true') {
      setAllowed(true);
    } else {
      setPrompted(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('age_gate_accepted', 'true');
    setAllowed(true);
  };

  if (!allowed) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#111827dd', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
        <div style={{ background: '#1f2937', padding: '2rem', borderRadius: '0.5rem', textAlign: 'center', maxWidth: '400px' }}>
          <h2>Age Verification</h2>
          <p>This site contains content intended for individuals 18 years or older. Please confirm your age to continue.</p>
          <button className="button" style={{ marginTop: '1rem' }} onClick={handleAccept}>I am 18 or older</button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}