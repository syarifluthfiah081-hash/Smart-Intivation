import { useState, useEffect, lazy, Suspense } from 'react';
import { Sidebar } from './components/Sidebar';
import type { ActiveTab } from './components/Sidebar';
import { logoutFirebase, subscribeToAuthChanges } from './services/auth';
import type { User } from './services/auth';
import type { GeneratedLetter } from './services/storage';
import { getSchoolProfile, getLetterHistory, clearStorageCache } from './services/storage';
import { Menu, X, FileText, Loader2 } from 'lucide-react';

// Lazy load pages for code splitting (reduces initial bundle size and speeds up first load)
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const MasterData = lazy(() => import('./pages/MasterData').then(m => ({ default: m.MasterData })));
const CreateLetter = lazy(() => import('./pages/CreateLetter').then(m => ({ default: m.CreateLetter })));
const HistoryPage = lazy(() => import('./pages/History').then(m => ({ default: m.HistoryPage })));

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [editLetterData, setEditLetterData] = useState<GeneratedLetter | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Subscribe to Firebase Auth changes on mount
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      if (currentUser) {
        // Pre-fetch/warm up cache in the background as soon as logged in
        getSchoolProfile().catch(() => {});
        getLetterHistory().catch(() => {});
      } else {
        // Clean cache on logout to avoid memory leak or session cross-talk
        clearStorageCache();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    try {
      await logoutFirebase();
      setUser(null);
      setEditLetterData(null);
      setSelectedTemplateId(null);
    } catch (err) {
      console.error('Gagal keluar dari akun:', err);
    }
  };

  // Navigasi internal antar tab
  const handleNavigateToTab = (tab: 'create-letter' | 'master-data' | 'history', templateId?: string) => {
    setEditLetterData(null); // Clear editing state when jumping from dashboard
    if (templateId) {
      setSelectedTemplateId(templateId);
    } else {
      setSelectedTemplateId(null);
    }
    setActiveTab(tab);
  };

  const handleEditLetter = (letter: GeneratedLetter) => {
    setEditLetterData(letter);
    setActiveTab('create-letter');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-400">Menghubungkan ke Database...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Suspense fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-white">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-sm font-semibold text-slate-400">Memuat Halaman Masuk...</p>
          </div>
        </div>
      }>
        <Login onLoginSuccess={handleLoginSuccess} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Sidebar - Desktop (hidden on print) */}
      <div className="hidden md:block">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          user={user} 
          onLogout={handleLogout} 
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        
        {/* Mobile Header (hidden on print) */}
        <header className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between md:hidden no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <span className="font-extrabold text-sm tracking-tight">Smart Letter</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-all"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Nav Menu Drawer (hidden on print) */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 text-slate-300 border-b border-slate-800 p-4 space-y-2 no-print">
            <button
              onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => { setActiveTab('master-data'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold ${activeTab === 'master-data' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
            >
              Profil Sekolah
            </button>
            <button
              onClick={() => { setActiveTab('create-letter'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold ${activeTab === 'create-letter' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
            >
              Buat Surat Baru
            </button>
            <button
              onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
            >
              Riwayat Surat
            </button>
            <div className="border-t border-slate-800 pt-3 mt-3 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-semibold truncate max-w-[150px]">{user.fullName}</span>
              <button
                onClick={handleLogout}
                className="text-[10px] text-rose-400 hover:text-rose-300 font-bold"
              >
                Keluar
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-xs text-slate-500 font-semibold animate-pulse">Memuat Halaman...</p>
              </div>
            </div>
          }>
            {activeTab === 'dashboard' && (
              <Dashboard 
                user={user} 
                onNavigateToTab={handleNavigateToTab} 
              />
            )}

            {activeTab === 'master-data' && (
              <MasterData />
            )}

            {activeTab === 'create-letter' && (
              <CreateLetter 
                editLetterData={editLetterData} 
                onClearEdit={() => setEditLetterData(null)}
                initialTemplateId={selectedTemplateId}
                onClearInitialTemplate={() => setSelectedTemplateId(null)}
                onNavigateToHistory={() => setActiveTab('history')} 
              />
            )}

            {activeTab === 'history' && (
              <HistoryPage 
                onEditLetter={handleEditLetter} 
              />
            )}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default App;
