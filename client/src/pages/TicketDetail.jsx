import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const API_BASE = '/api';

export default function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classifying, setClassifying] = useState(false);
  const [classifyError, setClassifyError] = useState(null);

  function fetchTicket() {
    return fetch(`${API_BASE}/tickets/${id}`)
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
  }

  useEffect(() => {
    fetchTicket();
  }, [id]);

  async function handleClassify() {
    setClassifyError(null);
    setClassifying(true);
    try {
      const res = await fetch(`${API_BASE}/tickets/${id}/classify`, {
        method: 'POST',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Classification failed');
      }
      const modelRun = await res.json();
      setTicket((prev) => ({ ...prev, latestModelRun: modelRun }));
    } catch (err) {
      setClassifyError(err.message);
    } finally {
      setClassifying(false);
    }
  }

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

  const run = ticket.latestModelRun;
  const parsed = run?.parsedJson || {};
  const confidence = run?.confidence ?? null;
  const needsReview = confidence !== null && confidence < 0.6;

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

        <div className="mt-6 border-t pt-6">
          <h2 className="mb-3 text-lg font-medium text-slate-800">AI Classification</h2>
          <button
            onClick={handleClassify}
            disabled={classifying}
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {classifying ? 'Classifying…' : 'Run AI classification'}
          </button>

          {classifyError && (
            <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {classifyError}
            </div>
          )}

          {run && (
            <div className="mt-4 rounded border bg-slate-50 p-4">
              {needsReview && (
                <span className="mb-3 inline-block rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                  Needs review
                </span>
              )}
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <span className="font-medium text-slate-600">Category:</span>{' '}
                  <span className="text-slate-800">{parsed.category}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-600">Urgency:</span>{' '}
                  <span className="text-slate-800">{parsed.urgency}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-600">Sentiment:</span>{' '}
                  <span className="text-slate-800">{parsed.sentiment}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-600">Confidence:</span>{' '}
                  <span className="text-slate-800">
                    {(confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              {parsed.rationale && (
                <p className="mt-3 text-slate-600">
                  <span className="font-medium text-slate-700">Rationale:</span> {parsed.rationale}
                </p>
              )}
              {parsed.suggestedResponse && (
                <div className="mt-3">
                  <p className="font-medium text-slate-700">Suggested response</p>
                  <p className="mt-1 whitespace-pre-wrap text-slate-700">
                    {parsed.suggestedResponse}
                  </p>
                </div>
              )}
              <p className="mt-2 text-xs text-slate-500">
                Model: {run.modelName} · {new Date(run.createdAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
