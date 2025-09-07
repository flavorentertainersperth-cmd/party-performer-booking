import PerformerGrid from './components/PerformerGrid';
import AgeGate from './components/AgeGate';

export default function HomePage() {
  return (
    <AgeGate>
      <main className="container">
        <section style={{ textAlign: 'center', padding: '2rem 0' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Find Your Perfect Performer</h1>
          <p style={{ maxWidth: '600px', margin: '0 auto 2rem auto' }}>
            Welcome to the ultimate marketplace for booking performers for your next event. Browse our talented roster, check
            real-time availability, and book with confidence using PayID.
          </p>
        </section>
        <section>
          <h2>Performers</h2>
          <PerformerGrid />
        </section>
      </main>
    </AgeGate>
  );
}