const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
];

export default function LanguagePicker({ selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.value}
          onClick={() => onChange(lang.value)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 ${selected === lang.value
              ? 'bg-[#667eea]/15 text-[#667eea] border-[#667eea]/40 shadow-[0_0_10px_rgba(102,126,234,0.15)] scale-105'
              : 'bg-transparent text-[#718096] border-[#e5e4d0] hover:border-[#d4d0b0] hover:text-[#2d3748]'
            }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
