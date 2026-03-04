import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const LANG_MAP = {
  javascript: 'javascript',
  python: 'python',
  c: 'c',
  cpp: 'cpp',
  csharp: 'csharp',
  php: 'php',
};

export default function HistoryTable({ rows }) {
  const [expanded, setExpanded] = useState(null);

  if (!rows || rows.length === 0) {
    return <p className="text-sm text-zinc-400 text-center py-12">No translation history yet.</p>;
  }

  const toggle = (id) => setExpanded(expanded === id ? null : id);

  const statusBadge = (status) => {
    const base = 'px-2 py-0.5 rounded-full text-xs font-medium';
    if (status === 'success') return <span className={`${base} bg-zinc-100 text-zinc-700`}>success</span>;
    if (status === 'fallback') return <span className={`${base} bg-yellow-50 text-yellow-700 border border-yellow-200`}>fallback</span>;
    return <span className={`${base} bg-red-50 text-red-700 border border-red-200`}>error</span>;
  };

  return (
    <div className="border border-zinc-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 border-b border-zinc-200">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Time</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Target</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Engine</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            let code = '';
            try { code = JSON.parse(row.translatedCode || '[]').join('\n'); } catch {}

            return (
              <>
                <tr
                  key={row.id}
                  className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors cursor-pointer"
                  onClick={() => toggle(row.id)}
                >
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(row.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs bg-zinc-100 px-2 py-0.5 rounded">
                      {row.targetLanguage || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{row.engineUsed || '—'}</td>
                  <td className="px-4 py-3">{statusBadge(row.status)}</td>
                  <td className="px-4 py-3 text-right text-zinc-400 text-xs">
                    {expanded === row.id ? '▲' : '▼'}
                  </td>
                </tr>
                {expanded === row.id && (
                  <tr key={`${row.id}-detail`} className="bg-zinc-50">
                    <td colSpan={5} className="px-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wide">Source (Java)</p>
                          <div className="rounded-lg overflow-hidden border border-zinc-200 text-xs max-h-48 overflow-y-auto">
                            <SyntaxHighlighter
                              language="java"
                              style={oneLight}
                              customStyle={{ margin: 0, fontSize: '0.75rem' }}
                            >
                              {row.javaCode || '// No source code'}
                            </SyntaxHighlighter>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wide">
                            Translated ({row.targetLanguage})
                          </p>
                          <div className="rounded-lg overflow-hidden border border-zinc-200 text-xs max-h-48 overflow-y-auto">
                            {row.error ? (
                              <p className="p-3 text-red-500 text-xs">{row.error}</p>
                            ) : (
                              <SyntaxHighlighter
                                language={LANG_MAP[row.targetLanguage] || 'text'}
                                style={oneLight}
                                customStyle={{ margin: 0, fontSize: '0.75rem' }}
                              >
                                {code || '// No output'}
                              </SyntaxHighlighter>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
