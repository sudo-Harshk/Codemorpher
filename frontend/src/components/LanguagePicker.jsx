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
          className="px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300"
          style={
            selected === lang.value
              ? {
                backgroundColor: 'var(--secondary-soft)',
                color: 'var(--secondary)',
                borderColor: 'var(--secondary)',
                transform: 'scale(1.05)',
              }
              : {
                backgroundColor: 'transparent',
                color: 'var(--text-muted)',
                borderColor: 'var(--border)',
              }
          }
          onMouseEnter={(e) => {
            if (selected !== lang.value) {
              e.currentTarget.style.borderColor = 'var(--secondary)';
              e.currentTarget.style.color = 'var(--text)';
            }
          }}
          onMouseLeave={(e) => {
            if (selected !== lang.value) {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }
          }}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
