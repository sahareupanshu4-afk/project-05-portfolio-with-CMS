'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Something went wrong!</h2>
            <p className="text-slate-400 mb-4">{error.message}</p>
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}