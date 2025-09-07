import Link from 'next/link';

export default function DashboardIndex() {
  return (
    <main className="container">
      <h1>Dashboard</h1>
      <p>Select your dashboard:</p>
      <ul>
        <li><Link href="/dashboard/admin">Admin Dashboard</Link></li>
        <li><Link href="/dashboard/performer">Performer Dashboard</Link></li>
        <li><Link href="/dashboard/client">Client Dashboard</Link></li>
      </ul>
    </main>
  );
}