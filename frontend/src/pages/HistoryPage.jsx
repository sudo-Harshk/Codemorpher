import { useEffect, useState } from 'react';
import HistoryTable from '../components/HistoryTable.jsx';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function HistoryPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/history`);
      if (!res.ok) throw new Error('Failed to load history');
      const data = await res.json();
      setRows(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  return (
    <main className="p-6 relative z-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Translation History</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Last 50 translation requests stored locally</p>
          </div>
          <button
            onClick={fetchHistory}
            className="text-sm font-bold px-5 py-2.5 rounded-full shadow-sm transition-all hover:scale-105 active:scale-95 border"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          >
            ↻ Refresh
          </button>
        </div>

        {loading && (
          <div className="text-center py-16 text-sm animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading…</div>
        )}
        {error && (
          <div
            className="text-center py-16 text-sm rounded-xl border"
            style={{
              color: 'var(--danger)',
              backgroundColor: 'var(--danger-soft)',
              borderColor: 'var(--danger)',
            }}
          >
            {error}
          </div>
        )}
        {!loading && !error && (
          <div className="card p-6 theme-surface raise press">
            <HistoryTable rows={rows} />
          </div>
        )}
      </div>
    </main>
  );
}
