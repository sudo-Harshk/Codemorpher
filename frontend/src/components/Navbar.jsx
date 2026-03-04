import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `text-sm font-medium transition-colors ${
      pathname === path
        ? 'text-zinc-900 border-b-2 border-zinc-900 pb-0.5'
        : 'text-zinc-500 hover:text-zinc-900'
    }`;

  return (
    <nav className="border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src="/assets/logo-black.png" alt="Codemorpher" className="w-8 h-8 object-contain" />
        <span className="font-bold text-lg tracking-tight">CodeMorpher</span>
      </div>
      <div className="flex items-center gap-6">
        <Link to="/" className={linkClass('/')}>Translator</Link>
        <Link to="/history" className={linkClass('/history')}>History</Link>
      </div>
    </nav>
  );
}
