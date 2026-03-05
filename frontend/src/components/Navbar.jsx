import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `text-sm font-medium transition-all duration-300 ${pathname === path
      ? 'text-[#2d3748] border-b-2 border-[#667eea]/70 pb-0.5'
      : 'text-[#2d3748]/60 hover:text-[#2d3748]/90'
    }`;

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-md border-b border-[#e5e4d0] px-6 py-4 flex items-center justify-between" style={{background: 'linear-gradient(90deg, rgba(225,217,188,0.8) 0%, rgba(240,240,219,0.8) 50%, rgba(225,217,188,0.8) 100%)'}}>
      <div className="flex items-center gap-3">
        <img src="/assets/logo-black.png" alt="Codemorpher" className="w-8 h-8 object-contain opacity-80" />
        <span className="font-bold text-lg tracking-tight text-[#2d3748]/90">CodeMorpher</span>
      </div>
      <div className="flex items-center gap-6">
        <Link to="/" className={linkClass('/')}>Translator</Link>
        <Link to="/history" className={linkClass('/history')}>History</Link>
      </div>
    </nav>
  );
}
