import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
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
      <div className="flex items-center border-b border-zinc-200 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'Code' && (
          <div className={`rounded-lg overflow-hidden border ${fallback ? 'border-red-300' : 'border-zinc-200'}`}>
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-100 border-b border-zinc-200">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                {targetLanguage}
              </span>
              {!loading && codeStr && (
                <button
                  onClick={handleCopy}
                  className="text-xs text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              )}
            </div>
            {loading ? (
              <div className="p-4 bg-zinc-50 border-t border-zinc-200 animate-pulse">
                <div className="space-y-2">
                  <div className="h-3 bg-zinc-200 rounded w-11/12" />
                  <div className="h-3 bg-zinc-200 rounded w-10/12" />
                  <div className="h-3 bg-zinc-200 rounded w-9/12" />
                  <div className="h-3 bg-zinc-200 rounded w-11/12" />
                  <div className="h-3 bg-zinc-200 rounded w-8/12" />
                  <div className="h-3 bg-zinc-200 rounded w-10/12" />
                </div>
              </div>
            ) : codeStr ? (
              <SyntaxHighlighter
                language={LANG_MAP[targetLanguage] || 'text'}
                style={oneLight}
                customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.8rem', maxHeight: '420px' }}
                showLineNumbers
              >
                {codeStr}
              </SyntaxHighlighter>
            ) : (
              <div className="p-6 text-sm text-zinc-400 font-mono">
                // Translation will appear here…
              </div>
            )}
          </div>
        )}

{activeTab === 'Debugging' && (
  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 max-h-[420px] overflow-y-auto">
    {loading ? (
      <div className="space-y-3 animate-pulse">
        <div className="h-3 bg-zinc-200 rounded w-10/12" />
        <div className="h-3 bg-zinc-200 rounded w-9/12" />
        <div className="h-3 bg-zinc-200 rounded w-11/12" />
        <div className="h-3 bg-zinc-200 rounded w-8/12" />
      </div>
    ) : Array.isArray(result?.debuggingSteps) && result.debuggingSteps.length ? (
      <div className="space-y-2 text-sm text-zinc-700">
        {result.debuggingSteps.map((step, i) => (
          <p key={i}>{step}</p>
        ))}
      </div>
    ) : (
      <p className="text-sm text-zinc-400">
        Debugging steps will appear here after translation.
      </p>
    )}
  </div>
)}

        {activeTab === 'Algorithm' && (
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-3 bg-zinc-200 rounded w-9/12" />
                <div className="h-3 bg-zinc-200 rounded w-10/12" />
                <div className="h-3 bg-zinc-200 rounded w-8/12" />
                <div className="h-3 bg-zinc-200 rounded w-9/12" />
              </div>
            ) : Array.isArray(result?.algorithm) && result.algorithm.length ? (
              <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-700">
                {result.algorithm.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-zinc-400">Algorithm steps will appear here after translation.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
