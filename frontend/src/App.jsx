import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import TranslatorPage from './pages/TranslatorPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';

export default function App() {
  return (
    <div className="min-h-screen text-[#2d3748] selection:bg-[#667eea]/30 selection:text-[#2d3748] relative overflow-hidden font-sans flex flex-col" style={{background: 'linear-gradient(135deg, #E1D9BC 0%, #F0F0DB 50%, #E1D9BC 100%)'}}>
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[20%] w-[700px] h-[700px] bg-[#667eea]/[0.08] blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-[#48bb78]/[0.05] blur-[140px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full flex-1">
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
