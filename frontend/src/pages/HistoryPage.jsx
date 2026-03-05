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
            <h1 className="text-2xl font-bold text-[#2d3748]/90">Translation History</h1>
            <p className="text-sm text-[#718096] mt-1">Last 50 translation requests stored locally</p>
          </div>
          <button
            onClick={fetchHistory}
            className="text-sm font-bold text-[#2d3748] backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm transition-all hover:scale-105 active:scale-95 border border-[#e5e4d0]" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(240,240,219,0.75) 100%)'}}
          >
            ↻ Refresh
          </button>
        </div>

        {loading && (
          <div className="text-center py-16 text-[#718096] text-sm animate-pulse">Loading…</div>
        )}
        {error && (
          <div className="text-center py-16 text-[#e53e3e] text-sm bg-[#e53e3e]/[0.06] rounded-xl border border-[#e53e3e]/15">{error}</div>
        )}
        {!loading && !error && (
          <div className="backdrop-blur-xl border border-[#e5e4d0] rounded-2xl p-6 shadow-lg shadow-gray-300/40" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(225,217,188,0.85) 100%)'}}>
            <HistoryTable rows={rows} />
          </div>
        )}
      </div>
    </main>
  );
}
