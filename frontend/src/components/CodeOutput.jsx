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
      <div className="flex items-center border-b border-[#e5e4d0] mb-6 gap-2 px-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-t-lg ${activeTab === tab
              ? 'bg-[#667eea]/10 text-[#667eea] border-b-2 border-[#667eea]/60'
              : 'text-[#718096] hover:text-[#2d3748] hover:bg-[#f8f7ed] border-b-2 border-transparent'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto rounded-xl shadow-inner shadow-gray-300/40" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(240,240,219,0.65) 100%)'}}>
        {activeTab === 'Code' && (
          <div className={`rounded-xl overflow-hidden border h-full flex flex-col ${fallback ? 'border-[#e53e3e]/30' : 'border-[#e5e4d0]'}`} style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(225,217,188,0.75) 100%)'}}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e4d0" style={{background: 'linear-gradient(90deg, rgba(255,255,255,0.75) 0%, rgba(240,240,219,0.75) 100%)'}}>
              <span className="text-xs font-semibold text-[#718096] uppercase tracking-widest flex items-center gap-2">
                <span className="flex gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span><span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span><span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span></span>
                {targetLanguage}
              </span>
              {!loading && codeStr && (
                <button
                  onClick={handleCopy}
                  className="text-xs font-medium text-[#2d3748]/60 hover:text-[#2d3748] transition-colors px-3 py-1.5 rounded-md" style={{background: 'linear-gradient(135deg, rgba(248,247,237,1) 0%, rgba(229,228,208,1) 100%)'}}
                >
                  {copied ? '✓ Copied' : 'Copy Code'}
                </button>
              )}
            </div>
            {loading ? (
              <div className="p-6 animate-pulse flex-1" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(240,240,219,0.55) 100%)'}}>
                <div className="space-y-4">
                  <div className="h-4 bg-[#e5e4d0] rounded w-11/12" />
                  <div className="h-4 bg-[#e5e4d0] rounded w-10/12" />
                  <div className="h-4 bg-[#e5e4d0] rounded w-9/12" />
                  <div className="h-4 bg-[#e5e4d0] rounded w-11/12" />
                  <div className="h-4 bg-[#e5e4d0] rounded w-8/12" />
                  <div className="h-4 bg-[#e5e4d0] rounded w-10/12" />
                </div>
              </div>
            ) : codeStr ? (
              <SyntaxHighlighter
                language={LANG_MAP[targetLanguage] || 'text'}
                style={oneLight}
                customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.875rem', padding: '1.5rem', flex: 1, backgroundColor: 'transparent' }}
                showLineNumbers
              >
                {codeStr}
              </SyntaxHighlighter>
            ) : (
              <div className="p-8 text-sm text-[#718096] font-mono italic flex-1">
                // Translation will appear here…
              </div>
            )}
          </div>
        )}

        {activeTab === 'Debugging' && (
          <div className="border border-[#e5e4d0] rounded-xl p-6 h-full overflow-y-auto" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(225,217,188,0.55) 100%)'}}>
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-[#e5e4d0] rounded w-10/12" />
                <div className="h-4 bg-[#e5e4d0] rounded w-9/12" />
                <div className="h-4 bg-[#e5e4d0] rounded w-11/12" />
                <div className="h-4 bg-[#e5e4d0] rounded w-8/12" />
              </div>
            ) : Array.isArray(result?.debuggingSteps) && result.debuggingSteps.length ? (
              <div className="space-y-3 text-sm text-[#2d3748]/70 leading-relaxed font-mono">
                {result.debuggingSteps.map((step, i) => (
                  <p key={i} className="flex gap-3 items-start"><span className="text-[#667eea]/60 mt-0.5">↳</span> <span>{step}</span></p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#718096] font-mono italic">
        // Debugging steps will appear here.
              </p>
            )}
          </div>
        )}

        {activeTab === 'Algorithm' && (
          <div className="border border-[#e5e4d0] rounded-xl p-6 h-full overflow-y-auto" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(225,217,188,0.55) 100%)'}}>
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-[#e5e4d0] rounded w-9/12" />
                <div className="h-4 bg-[#e5e4d0] rounded w-10/12" />
                <div className="h-4 bg-[#e5e4d0] rounded w-8/12" />
                <div className="h-4 bg-[#e5e4d0] rounded w-9/12" />
              </div>
            ) : Array.isArray(result?.algorithm) && result.algorithm.length ? (
              <ol className="list-decimal list-outside ml-4 space-y-3 text-sm text-[#2d3748]/70 leading-relaxed marker:text-[#718096]">
                {result.algorithm.map((step, i) => (
                  <li key={i} className="pl-2">{step}</li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-[#718096] font-mono italic">
                // Algorithm steps will appear here.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
