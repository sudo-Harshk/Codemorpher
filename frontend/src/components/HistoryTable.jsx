import { useState, Fragment } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
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
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  if (!rows || rows.length === 0) {
    return <p className="text-sm text-center py-12" style={{ color: 'var(--text-muted)' }}>No translation history yet.</p>;
  }

  const toggle = (id) => setExpanded(expanded === id ? null : id);

  const statusBadge = (status) => {
    const base = 'px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-widest uppercase';
    if (status === 'success') {
      return (
        <span
          className={base}
          style={{
            backgroundColor: 'var(--accent-soft)',
            color: 'var(--accent)',
            border: '1px solid var(--accent)',
          }}
        >
          success
        </span>
      );
    }
    return (
      <span
        className={base}
        style={{
          backgroundColor: 'var(--surface-2)',
          color: 'var(--text-muted)',
          border: '1px solid var(--border)',
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
      <table className="w-full text-sm">
        <thead style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
          <tr>
            <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Time</th>
            <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Target</th>
            <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Engine</th>
            <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Status</th>
            <th className="px-4 py-4"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            let code = '';
            try { code = JSON.parse(row.translatedCode || '[]').join('\n'); } catch { }

            return (
              <Fragment key={row.id}>
                <tr
                  className="transition-colors cursor-pointer"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  onClick={() => toggle(row.id)}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <td className="px-4 py-4" style={{ color: 'var(--text)' }}>
                    {new Date(row.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className="font-mono text-xs px-2.5 py-1 rounded border"
                      style={{
                        backgroundColor: 'var(--surface-2)',
                        borderColor: 'var(--border)',
                        color: 'var(--text)',
                      }}
                    >
                      {row.targetLanguage || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs" style={{ color: 'var(--text-muted)' }}>{row.engineUsed || '—'}</td>
                  <td className="px-4 py-4">{statusBadge(row.status)}</td>
                  <td className="px-4 py-4 text-right text-xs" style={{ color: 'var(--text-muted)' }}>
                    {expanded === row.id ? '▲' : '▼'}
                  </td>
                </tr>
                {expanded === row.id && (
                  <tr key={`${row.id}-detail`} style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-2)' }}>
                    <td colSpan={5} className="px-6 py-6" style={{ borderLeft: '2px solid var(--accent)' }}>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-[10px] font-bold mb-2 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Source (Java)</p>
                          <div className="rounded-lg overflow-hidden border text-xs max-h-48 overflow-y-auto" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                            <SyntaxHighlighter
                              language="java"
                              style={isDark ? vscDarkPlus : oneLight}
                              customStyle={{ margin: 0, fontSize: '0.75rem', padding: '1rem', backgroundColor: 'transparent' }}
                            >
                              {row.javaCode || '// No source code'}
                            </SyntaxHighlighter>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold mb-2 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                            Translated ({row.targetLanguage})
                          </p>
                          <div className="rounded-lg overflow-hidden border text-xs max-h-48 overflow-y-auto" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                            {row.error ? (
                              <p className="p-4 text-xs" style={{ color: 'var(--danger)', backgroundColor: 'var(--danger-soft)' }}>{row.error}</p>
                            ) : (
                              <SyntaxHighlighter
                                language={LANG_MAP[row.targetLanguage] || 'text'}
                                style={isDark ? vscDarkPlus : oneLight}
                                customStyle={{ margin: 0, fontSize: '0.75rem', padding: '1rem', backgroundColor: 'transparent' }}
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
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
