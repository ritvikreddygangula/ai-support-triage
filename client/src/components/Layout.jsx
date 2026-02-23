import { Link } from 'react-router-dom';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold text-slate-800 hover:text-slate-600">
            AI Support Triage
          </Link>
          <Link
            to="/tickets/new"
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            New Ticket
          </Link>
        </div>
      </nav>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
