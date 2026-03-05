import { useState } from 'react';
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

  if (!rows || rows.length === 0) {
    return <p className="text-sm text-[#718096] text-center py-12">No translation history yet.</p>;;
  }

  const toggle = (id) => setExpanded(expanded === id ? null : id);

  const statusBadge = (status) => {
    const base = 'px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-widest uppercase';
    if (status === 'success') return <span className={`${base} bg-[#667eea]/[0.08] text-[#667eea] border border-[#667eea]/20`}>success</span>;
    if (status === 'fallback') return <span className={`${base} bg-[#f8f7ed] text-[#718096] border border-[#e5e4d0]`}>fallback</span>;
    return <span className={`${base} bg-[#f8f7ed] text-[#718096] border border-[#e5e4d0]`}>error</span>;
  };

  return (
    <div className="rounded-xl overflow-hidden border border-[#e5e4d0]" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(240,240,219,0.65) 100%)'}}>
      <table className="w-full text-sm">
        <thead className="border-b border-[#e5e4d0]" style={{background: 'linear-gradient(90deg, rgba(255,255,255,0.65) 0%, rgba(225,217,188,0.65) 100%)'}}>
          <tr>
            <th className="text-left px-4 py-4 text-xs font-bold text-[#718096] uppercase tracking-widest">Time</th>
            <th className="text-left px-4 py-4 text-xs font-bold text-[#718096] uppercase tracking-widest">Target</th>
            <th className="text-left px-4 py-4 text-xs font-bold text-[#718096] uppercase tracking-widest">Engine</th>
            <th className="text-left px-4 py-4 text-xs font-bold text-[#718096] uppercase tracking-widest">Status</th>
            <th className="px-4 py-4"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            let code = '';
            try { code = JSON.parse(row.translatedCode || '[]').join('\n'); } catch { }

            return (
              <>
                <tr
                  key={row.id}
                  className="border-b border-[#f8f7ed] hover:bg-[#f8f7ed] transition-colors cursor-pointer"
                  onClick={() => toggle(row.id)}
                >
                  <td className="px-4 py-4 text-[#2d3748]/70">
                    {new Date(row.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-mono text-xs backdrop-blur-md border border-[#e5e4d0] px-2.5 py-1 rounded text-[#2d3748]" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(240,240,219,0.75) 100%)'}}>
                      {row.targetLanguage || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[#718096] text-xs">{row.engineUsed || '—'}</td>
                  <td className="px-4 py-4">{statusBadge(row.status)}</td>
                  <td className="px-4 py-4 text-right text-[#718096] text-xs">
                    {expanded === row.id ? '▲' : '▼'}
                  </td>
                </tr>
                {expanded === row.id && (
                  <tr key={`${row.id}-detail`} className="border-b border-[#e5e4d0]" style={{background: 'linear-gradient(135deg, rgba(248,247,237,1) 0%, rgba(229,228,208,1) 100%)'}}>
                    <td colSpan={5} className="px-6 py-6 border-l-2 border-l-[#667eea]/40">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-[10px] font-bold text-[#718096] mb-2 uppercase tracking-widest">Source (Java)</p>
                          <div className="rounded-lg overflow-hidden border border-[#e5e4d0] text-xs max-h-48 overflow-y-auto" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(225,217,188,0.65) 100%)'}}>
                            <SyntaxHighlighter
                              language="java"
                              style={oneLight}
                              customStyle={{ margin: 0, fontSize: '0.75rem', padding: '1rem', backgroundColor: 'transparent' }}
                            >
                              {row.javaCode || '// No source code'}
                            </SyntaxHighlighter>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#718096] mb-2 uppercase tracking-widest">
                            Translated ({row.targetLanguage})
                          </p>
                          <div className="rounded-lg overflow-hidden border border-[#e5e4d0] text-xs max-h-48 overflow-y-auto" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(225,217,188,0.65) 100%)'}}>
                            {row.error ? (
                              <p className="p-4 text-[#e53e3e] text-xs bg-[#e53e3e]/[0.06]">{row.error}</p>
                            ) : (
                              <SyntaxHighlighter
                                language={LANG_MAP[row.targetLanguage] || 'text'}
                                style={oneLight}
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
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
