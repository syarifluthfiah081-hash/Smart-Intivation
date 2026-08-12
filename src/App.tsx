import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Generator } from './pages/Generator';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { seedDefaultSettings } from './services/db';

function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  
  // Shared state for navigation from dashboard or history to generator
  const [selectedLetterType, setSelectedLetterType] = useState<
    'skl' | 'undangan' | 'tugas' | 'pengantar' | 'rekomendasi' | 'pindahan'
  >('skl');
  const [editLetterData, setEditLetterData] = useState<any>(null);

  // Pre-seed default settings on startup
  useEffect(() => {
    seedDefaultSettings();
  }, []);

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard 
            setCurrentTab={setCurrentTab} 
            setSelectedLetterType={(type) => {
              setSelectedLetterType(type);
              setEditLetterData(null); // Clear editing context when starting fresh
            }} 
          />
        );
      case 'generator':
        return (
          <Generator 
            selectedType={selectedLetterType} 
            setSelectedType={setSelectedLetterType}
            editLetterData={editLetterData}
            setEditLetterData={setEditLetterData}
          />
        );
      case 'history':
        return (
          <History 
            setCurrentTab={setCurrentTab}
            setSelectedLetterType={setSelectedLetterType}
            setEditLetterData={setEditLetterData}
          />
        );
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden print:overflow-visible print:h-auto">
        {/* Header - Hidden on Print */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 no-print">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800 text-lg tracking-tight uppercase">
              {currentTab === 'dashboard' && 'Dashboard Utama'}
              {currentTab === 'generator' && 'Pembuat Surat Dinamis'}
              {currentTab === 'history' && 'Arsip Dokumen Sekolah'}
              {currentTab === 'settings' && 'Pengaturan Aplikasi'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Local Storage Mode
            </span>
          </div>
        </header>

        {/* View Component Wrapper */}
        <div className="flex-1 overflow-y-auto print:overflow-visible print:h-auto">
          {renderActiveTab()}
        </div>
      </main>
    </div>
  );
}

export default App;
