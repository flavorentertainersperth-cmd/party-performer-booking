"use client";
import React, { useEffect, useState } from 'react';
import PerformerCard from './PerformerCard';

interface Performer {
  id: string;
  stage_name: string;
  availability_status: 'available' | 'unavailable';
}

export default function PerformerGrid() {
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchPerformers() {
      setLoading(true);
      const params = new URLSearchParams();
      if (availabilityFilter) params.set('availability', availabilityFilter);
      const res = await fetch(`/api/performers?${params.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      setPerformers(data);
      setLoading(false);
    }
    fetchPerformers();
  }, [availabilityFilter]);

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="availability" style={{ marginRight: '0.5rem' }}>Availability:</label>
        <select
          id="availability"
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </div>
      {loading ? (
        <p>Loading performers...</p>
      ) : (
        <div className="grid">
          {performers.map((perf) => (
            <PerformerCard key={perf.id} {...perf} />
          ))}
        </div>
      )}
    </div>
  );
}