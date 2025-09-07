import './styles/globals.css';
import Link from 'next/link';
import { cookies } from 'next/headers';

export const metadata = {
  title: 'Performer Booking Platform',
  description: 'Book party performers with ease via PayID payment',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '0.5rem 1rem' }}>
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/">Home</Link>
            <Link href="/book">Book</Link>
            <Link href="/dashboard/performer">Performer Dashboard</Link>
            <Link href="/dashboard/client">My Bookings</Link>
            <Link href="/dashboard/admin">Admin</Link>
            <Link href="/legal/terms">Terms</Link>
            <Link href="/legal/privacy">Privacy</Link>
            <Link href="/legal/content-policy">Content Policy</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}