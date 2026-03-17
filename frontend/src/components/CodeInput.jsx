import { useRef } from 'react';
import LanguagePicker from './LanguagePicker.jsx';

const VALIDATION_ERROR_CODES = [
  'EMPTY_INPUT',
  'TOO_SHORT',
  'NOT_CODE_LIKE',
  'NON_CODE_FORMAT',
  'WRONG_LANGUAGE',
  'INVALID_JAVA_SYNTAX',
  'PARSE_FAILED',
];

export default function CodeInput({
  code,
  onCodeChange,
  targetLanguage,
  onLanguageChange,
  onTranslate,
  onUpload,
  loading,
  error,
  errorCode,
  onDismissError,
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
          className="text-xs transition-colors cursor-pointer"
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
      {error && (
        <div
          className="rounded-xl flex gap-3 items-start p-4 animate-slide-in-error"
          style={{
            backgroundColor: VALIDATION_ERROR_CODES.includes(errorCode)
              ? 'var(--warning-soft)'
              : 'var(--danger-soft)',
            borderLeft: `4px solid ${VALIDATION_ERROR_CODES.includes(errorCode) ? 'var(--warning)' : 'var(--danger)'}`,
          }}
        >
          <div
            className="shrink-0 mt-0.5"
            style={{ color: VALIDATION_ERROR_CODES.includes(errorCode) ? 'var(--warning)' : 'var(--danger)' }}
            aria-hidden
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm leading-relaxed pr-6"
              style={{
                color: VALIDATION_ERROR_CODES.includes(errorCode) ? 'var(--text)' : 'var(--danger)',
              }}
            >
              {error}
            </p>
          </div>
          {onDismissError && (
            <button
              type="button"
              onClick={onDismissError}
              className="shrink-0 p-1 rounded-md transition-colors hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-current"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Dismiss"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

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
          className="flex-1 min-w-[140px] px-6 py-2.5 border rounded-full text-sm font-medium disabled:opacity-40 transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 hover:shadow-md active:shadow-sm"
          style={{
            backgroundColor: 'var(--secondary)',
            borderColor: 'var(--border-subtle)',
            color: 'var(--bg)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--secondary-soft)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--secondary)'; e.currentTarget.style.color = 'var(--bg)'; }}
        >
          📁 Upload Image
        </button>
        <button
          onClick={onTranslate}
          disabled={loading}
          className="flex-1 min-w-[140px] px-6 py-2.5 rounded-full text-sm font-bold hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-40 transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--accent)',
            border: '1px solid var(--accent)',
            color: 'var(--bg)',
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
