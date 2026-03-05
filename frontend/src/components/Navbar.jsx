import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { pathname } = useLocation();
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      try { localStorage.setItem('theme', 'dark'); } catch {}
    } else {
      root.classList.remove('dark');
      try { localStorage.setItem('theme', 'light'); } catch {}
    }
  }, [dark]);

  const linkClass = (path) =>
    `text-sm font-medium transition-all duration-300 ${pathname === path
      ? 'pb-0.5'
      : ''
    }`;

  const linkStyle = (path) =>
    pathname === path
      ? { color: 'var(--text)', borderBottom: '2px solid var(--accent)' }
      : { color: 'var(--text-muted)' };

  return (
    <nav
      className="sticky top-0 z-40 backdrop-blur-md px-6 py-4 flex items-center justify-between"
      style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-3">
        <img
          src={dark ? '/assets/logo.png' : '/assets/logo-black.png'}
          alt="Codemorpher"
          className="w-8 h-8 object-contain"
          style={{ filter: dark ? 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' : 'none', opacity: 0.9 }}
        />
        <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--text)' }}>CodeMorpher</span>
      </div>
      <div className="flex items-center gap-6">
        <Link to="/" className={linkClass('/')} style={linkStyle('/')}>Translator</Link>
        <Link to="/history" className={linkClass('/history')} style={linkStyle('/history')}>History</Link>
        <button
          onClick={() => setDark((v) => !v)}
          aria-label="Toggle theme"
          style={{
            position: 'relative',
            width: 46,
            height: 24,
            backgroundImage: `linear-gradient(90deg, var(--accent-soft), var(--secondary-soft))`,
            border: '1px solid var(--border)',
            borderRadius: 9999,
            padding: 0
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 2,
              left: dark ? 26 : 2,
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundImage: `linear-gradient(135deg, var(--accent), var(--secondary))`,
              transition: 'left 150ms ease',
            }}
          />
        </button>
      </div>
    </nav>
  );
}
