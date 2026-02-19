import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4">404</h2>
        <p className="text-slate-400 mb-4">Page not found</p>
        <Link href="/" className="px-4 py-2 bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors">
          Go Home
        </Link>
      </div>
    </div>
  );
}