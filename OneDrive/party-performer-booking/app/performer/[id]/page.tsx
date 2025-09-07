import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface PerformerDetailProps {
  params: { id: string };
}

export default async function PerformerDetailPage({ params }: PerformerDetailProps) {
  const id = params.id;
  const { data: performer, error: perfError } = await supabase
    .from('performers')
    .select('id, stage_name, bio, photo_url, availability_status')
    .eq('id', id)
    .single();
  if (perfError || !performer) {
    return <div className="container"><p>Performer not found.</p></div>;
  }
  const { data: services, error: svcError } = await supabase
    .from('performer_services')
    .select('id, rate_override, services(id, name, rate, unit)')
    .eq('performer_id', id);
  const serviceList = services?.map((ps) => {
    const baseRate = ps.services?.rate || 0;
    const rate = ps.rate_override || baseRate;
    return { id: ps.services?.id, name: ps.services?.name, rate, unit: ps.services?.unit };
  }) ?? [];
  return (
    <main className="container">
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {performer.photo_url && (
          <img src={performer.photo_url} alt={performer.stage_name} style={{ width: '300px', borderRadius: '0.5rem' }} />
        )}
        <div>
          <h1>{performer.stage_name}</h1>
          <p>{performer.bio}</p>
          <p>
            Status: <span className={`pill ${performer.availability_status}`}>{performer.availability_status}</span>
          </p>
          <h3>Services</h3>
          <ul>
            {serviceList.map((s) => (
              <li key={s.id}>{s.name} - ${s.rate}/{s.unit}</li>
            ))}
          </ul>
          <Link className="button" href={{ pathname: '/book', query: { performer: performer.id } }}>
            Book Now
          </Link>
        </div>
      </div>
    </main>
  );
}