import React from 'react';

interface PerformerCardProps {
  id: string;
  stage_name: string;
  availability_status: 'available' | 'unavailable';
}

export default function PerformerCard({ id, stage_name, availability_status }: PerformerCardProps) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', backgroundColor: '#fff' }}>
      <h3 style={{ margin: '0 0 0.5rem 0' }}>{stage_name}</h3>
      <span className={`pill ${availability_status}`}>{availability_status === 'available' ? 'Available' : 'Unavailable'}</span>
      <div style={{ marginTop: '0.75rem' }}>
        <a className="button" style={{ display: 'inline-block' }} href={`/performer/${id}`}>
          View Profile
        </a>
      </div>
    </div>
  );
}