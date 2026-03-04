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
        <label className="text-sm font-semibold text-zinc-700">Source Code (Java)</label>
        <button
          onClick={() => onCodeChange('')}
          title="Clear"
          className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Textarea */}
      <div className="relative flex-1">
        <textarea
          className="code-input w-full h-64 bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition"
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          placeholder="Enter your Java code here..."
          spellCheck={false}
        />
        <span className="absolute bottom-3 right-3 text-xs text-zinc-400 select-none">
          Lines: {lineCount}
        </span>
      </div>

      {/* Error messages */}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Language Picker */}
      <div>
        <p className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wide">Target Language</p>
        <LanguagePicker selected={targetLanguage} onChange={onLanguageChange} />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex-1 min-w-[100px] px-4 py-2 border border-zinc-300 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 transition-colors"
        >
          📁 Upload
        </button>
        <button
          onClick={onTranslate}
          disabled={loading}
          className="flex-1 min-w-[100px] px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-semibold hover:bg-zinc-700 disabled:opacity-50 transition-colors"
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
