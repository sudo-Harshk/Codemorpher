import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import TranslatorPage from './pages/TranslatorPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';

export default function App() {
  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <div className="flex flex-col h-full flex-1">
        <Navbar />
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<TranslatorPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
