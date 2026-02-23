import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const API_BASE = '/api';

export default function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/tickets/${id}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error('Ticket not found');
          throw new Error('Failed to fetch ticket');
        }
        return res.json();
      })
      .then(setTicket)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="rounded border bg-white p-8 text-center text-slate-500">
        Loading ticket…
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="space-y-4">
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
          {error || 'Ticket not found'}
        </div>
        <Link to="/" className="text-indigo-600 hover:underline">
          Back to tickets
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/" className="mb-4 inline-block text-indigo-600 hover:underline">
        ← Back to tickets
      </Link>
      <div className="rounded border bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-2xl font-semibold text-slate-800">{ticket.subject}</h1>
        <div className="space-y-2 text-sm text-slate-600">
          <p>
            <span className="font-medium text-slate-700">Created:</span>{' '}
            {new Date(ticket.createdAt).toLocaleString()}
          </p>
          {ticket.customerEmail && (
            <p>
              <span className="font-medium text-slate-700">Email:</span> {ticket.customerEmail}
            </p>
          )}
        </div>
        <div className="mt-4 rounded bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">Description</p>
          <p className="mt-1 whitespace-pre-wrap text-slate-700">{ticket.description}</p>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          AI classification coming in Step 2.
        </p>
      </div>
    </div>
  );
}
