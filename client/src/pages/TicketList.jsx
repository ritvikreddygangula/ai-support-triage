import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = '/api';

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/tickets`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch tickets');
        return res.json();
      })
      .then(setTickets)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded border bg-white p-8 text-center text-slate-500">
        Loading tickets…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-800">Tickets</h1>
      <div className="rounded border bg-white shadow-sm">
        {tickets.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No tickets yet.{' '}
            <Link to="/tickets/new" className="text-indigo-600 hover:underline">
              Create one
            </Link>
          </div>
        ) : (
          <ul className="divide-y">
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                <Link
                  to={`/tickets/${ticket.id}`}
                  className="block px-4 py-3 hover:bg-slate-50"
                >
                  <span className="font-medium text-slate-800">{ticket.subject}</span>
                  <span className="ml-2 text-sm text-slate-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
