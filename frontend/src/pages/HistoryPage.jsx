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
    <main className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Translation History</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Last 50 translation requests stored locally</p>
          </div>
          <button
            onClick={fetchHistory}
            className="text-sm text-zinc-600 hover:text-zinc-900 border border-zinc-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            ↻ Refresh
          </button>
        </div>

        {loading && (
          <div className="text-center py-16 text-zinc-400 text-sm">Loading…</div>
        )}
        {error && (
          <div className="text-center py-16 text-red-500 text-sm">{error}</div>
        )}
        {!loading && !error && (
          <HistoryTable rows={rows} />
        )}
      </div>
    </main>
  );
}
