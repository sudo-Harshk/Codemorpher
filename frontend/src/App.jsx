import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import TranslatorPage from './pages/TranslatorPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Navbar />
      <Routes>
        <Route path="/" element={<TranslatorPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </div>
  );
}
