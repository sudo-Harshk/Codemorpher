import { useRef } from 'react';
import LanguagePicker from './LanguagePicker.jsx';

export default function CodeInput({
  code,
  onCodeChange,
  targetLanguage,
  onLanguageChange,
  onTranslate,
  onUpload,
  loading,
  error,
}) {
  const fileInputRef = useRef(null);
  const lineCount = code.split('\n').length;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Source Code (Java)</label>
        <button
          onClick={() => onCodeChange('')}
          title="Clear"
          className="text-xs transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          Clear
        </button>
      </div>

      {/* Textarea */}
      <div className="relative flex-1">
        <textarea
          className="code-input w-full h-64 border rounded-xl p-4 text-sm resize-none focus:outline-none transition-all shadow-inner"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--text)',
          }}
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          placeholder="Enter your Java code here..."
          spellCheck={false}
        />
        <span className="absolute bottom-3 right-3 text-xs select-none" style={{ color: 'var(--text-muted)' }}>
          Lines: {lineCount}
        </span>
      </div>

      {/* Error messages */}
      {error && <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}

      {/* Language Picker */}
      <div>
        <p className="text-xs font-medium mb-2 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Target Language</p>
        <LanguagePicker selected={targetLanguage} onChange={onLanguageChange} />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap mt-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex-1 min-w-[140px] px-6 py-2.5 border rounded-full text-sm font-medium disabled:opacity-40 transition-colors"
          style={{
            backgroundColor: 'var(--surface-2)',
            borderColor: 'var(--border)',
            color: 'var(--text)',
          }}
        >
          📁 Upload Image
        </button>
        <button
          onClick={onTranslate}
          disabled={loading}
          className="flex-1 min-w-[140px] px-6 py-2.5 rounded-full text-sm font-bold text-white hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-40 transition-all shadow-sm"
          style={{
            backgroundColor: 'var(--accent)',
            border: '1px solid var(--accent)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent)'; }}
        >
          {loading ? 'Translating…' : 'Translate →'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onUpload(e.target.files[0])}
        />
      </div>
    </div>
  );
}
