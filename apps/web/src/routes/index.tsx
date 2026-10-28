import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({ component: Home });

function Home() {
  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold">Subscription Hub</h1>
      <Link to="/plans" className="mt-4 inline-block underline">
        Plans
      </Link>
    </main>
  );
}
