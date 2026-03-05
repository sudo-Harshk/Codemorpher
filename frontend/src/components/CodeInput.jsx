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
        <label className="text-sm font-semibold text-[#2d3748]/80">Source Code (Java)</label>
        <button
          onClick={() => onCodeChange('')}
          title="Clear"
          className="text-xs text-[#2d3748]/40 hover:text-[#2d3748]/70 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Textarea */}
      <div className="relative flex-1">
        <textarea
          className="code-input w-full h-64 backdrop-blur-xl border border-[#e5e4d0] rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-[#667eea]/50 focus:ring-1 focus:ring-[#667eea]/15 text-[#2d3748] placeholder-[#718096] transition-all shadow-inner" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(240,240,219,0.65) 100%)'}}
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          placeholder="Enter your Java code here..."
          spellCheck={false}
        />
        <span className="absolute bottom-3 right-3 text-xs text-[#718096] select-none">
          Lines: {lineCount}
        </span>
      </div>

      {/* Error messages */}
      {error && <p className="text-sm text-[#e53e3e]">{error}</p>}

      {/* Language Picker */}
      <div>
        <p className="text-xs font-medium text-[#718096] mb-2 uppercase tracking-widest">Target Language</p>
        <LanguagePicker selected={targetLanguage} onChange={onLanguageChange} />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap mt-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex-1 min-w-[140px] px-6 py-2.5 backdrop-blur-md border border-[#e5e4d0] rounded-full text-sm font-medium text-[#2d3748] hover:backdrop-blur-sm disabled:opacity-40 transition-colors" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(240,240,219,0.75) 100%)'}}
        >
          📁 Upload Image
        </button>
        <button
          onClick={onTranslate}
          disabled={loading}
          className="flex-1 min-w-[140px] px-6 py-2.5 bg-[#667eea] border border-[#667eea]/80 rounded-full text-sm font-bold text-white hover:bg-[#5a67d8] hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-40 transition-all shadow-sm shadow-[#667eea]/20"
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
