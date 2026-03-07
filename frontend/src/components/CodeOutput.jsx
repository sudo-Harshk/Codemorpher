import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const TABS = ['Code', 'Debugging', 'Algorithm'];

const LANG_MAP = {
  javascript: 'javascript',
  python: 'python',
  c: 'c',
  cpp: 'cpp',
  csharp: 'csharp',
  php: 'php',
};

export default function CodeOutput({ result, targetLanguage, fallback, loading = false }) {
  const [activeTab, setActiveTab] = useState('Code');
  const [copied, setCopied] = useState(false);
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const codeStr = Array.isArray(result?.translatedCode)
    ? result.translatedCode.join('\n')
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(codeStr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center mb-6 gap-2 px-2" style={{ borderBottom: '1px solid var(--border)' }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg tab-btn ${activeTab === tab ? 'active' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto rounded-xl shadow-inner theme-surface" style={{ backgroundColor: 'var(--surface)' }}>
        {activeTab === 'Code' && (
          <div
            className="rounded-xl overflow-hidden border h-full flex flex-col theme-surface"
            style={{
              borderColor: fallback ? 'var(--danger)' : 'var(--border)',
              backgroundColor: 'var(--surface)',
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3 theme-surface"
              style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-2)' }}
            >
              <span className="text-xs font-semibold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <span className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                </span>
                {targetLanguage}
              </span>
              {!loading && codeStr && (
                <button
                  onClick={handleCopy}
                  className="text-xs font-medium transition-colors px-3 py-1.5 rounded-md"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {copied ? '✓ Copied' : 'Copy Code'}
                </button>
              )}
            </div>
            {loading ? (
              <div className="p-6 flex-1 theme-surface" style={{ backgroundColor: 'var(--surface)' }}>
                <div className="space-y-4">
                  <div className="skeleton h-4 rounded w-11/12" />
                  <div className="skeleton h-4 rounded w-10/12" />
                  <div className="skeleton h-4 rounded w-9/12" />
                  <div className="skeleton h-4 rounded w-11/12" />
                  <div className="skeleton h-4 rounded w-8/12" />
                  <div className="skeleton h-4 rounded w-10/12" />
                </div>
              </div>
            ) : codeStr ? (
              <SyntaxHighlighter
                language={LANG_MAP[targetLanguage] || 'text'}
                style={isDark ? vscDarkPlus : oneLight}
                customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.875rem', padding: '1.5rem', flex: 1, backgroundColor: 'transparent' }}
                showLineNumbers
              >
                {codeStr}
              </SyntaxHighlighter>
            ) : (
              <div className="p-8 text-sm font-mono italic flex-1 theme-surface" style={{ color: 'var(--text-muted)' }}>
                // Translation will appear here…
              </div>
            )}
          </div>
        )}

        {activeTab === 'Debugging' && (
          <div
            className="border rounded-xl p-6 h-full overflow-y-auto theme-surface"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
          >
            {loading ? (
              <div className="space-y-4">
                <div className="skeleton h-4 rounded w-10/12" />
                <div className="skeleton h-4 rounded w-9/12" />
                <div className="skeleton h-4 rounded w-11/12" />
                <div className="skeleton h-4 rounded w-8/12" />
              </div>
            ) : Array.isArray(result?.debuggingSteps) && result.debuggingSteps.length ? (
              <div className="space-y-3 text-sm leading-relaxed font-mono" style={{ color: 'var(--text)' }}>
                {result.debuggingSteps.map((step, i) => (
                  <p key={i} className="flex gap-3 items-start">
                    <span className="mt-0.5" style={{ color: 'var(--accent)' }}>↳</span>
                    <span>{step}</span>
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm font-mono italic" style={{ color: 'var(--text-muted)' }}>
                // Debugging steps will appear here.
              </p>
            )}
          </div>
        )}

        {activeTab === 'Algorithm' && (
          <div
            className="border rounded-xl p-6 h-full overflow-y-auto theme-surface"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
          >
            {loading ? (
              <div className="space-y-4">
                <div className="skeleton h-4 rounded w-9/12" />
                <div className="skeleton h-4 rounded w-10/12" />
                <div className="skeleton h-4 rounded w-8/12" />
                <div className="skeleton h-4 rounded w-9/12" />
              </div>
            ) : Array.isArray(result?.algorithm) && result.algorithm.length ? (
              <ol className="list-decimal list-outside ml-4 space-y-3 text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                {result.algorithm.map((step, i) => (
                  <li key={i} className="pl-2" style={{ '--tw-prose-counters': 'var(--text-muted)' }}>{step}</li>
                ))}
              </ol>
            ) : (
              <p className="text-sm font-mono italic" style={{ color: 'var(--text-muted)' }}>
                // Algorithm steps will appear here.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
