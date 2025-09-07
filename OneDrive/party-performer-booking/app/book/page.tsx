import BookingWizard from '../components/BookingWizard';

export default function BookPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const defaultPerformerId = typeof searchParams?.performer === 'string' ? searchParams.performer : undefined;
  return (
    <main className="container">
      <h1>Book a Performer</h1>
      <p>Follow the steps to create your booking and pay a deposit via PayID.</p>
      <BookingWizard defaultPerformerId={defaultPerformerId} />
    </main>
  );
}