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
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            selected === lang.value
              ? 'bg-zinc-900 text-white border-zinc-900'
              : 'bg-white text-zinc-600 border-zinc-300 hover:border-zinc-500 hover:text-zinc-900'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
