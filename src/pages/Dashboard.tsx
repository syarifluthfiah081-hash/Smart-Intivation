import React, { useState, useEffect } from 'react';
import { db, seedDefaultSettings, type SchoolSettings, type GeneratedLetter } from '../services/db';
import { LETTER_SCHEMAS, formatIndonesianDate } from '../templates';
import { 
  FileText, 
  Archive, 
  Plus, 
  School, 
  ChevronRight, 
  Sparkles,
  Calendar
} from 'lucide-react';

interface DashboardProps {
  setCurrentTab: (tab: string) => void;
  setSelectedLetterType?: (type: any) => void; // If they click a quick letter template, set the generator type
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  setCurrentTab,
  setSelectedLetterType 
}) => {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [letterCount, setLetterCount] = useState(0);
  const [recentLetters, setRecentLetters] = useState<GeneratedLetter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const schoolData = await seedDefaultSettings();
        setSettings(schoolData);

        const totalLetters = await db.letters.count();
        setLetterCount(totalLetters);

        const letters = await db.letters.orderBy('id').reverse().limit(5).toArray();
        setRecentLetters(letters);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleQuickCreate = (type: any) => {
    if (setSelectedLetterType) {
      setSelectedLetterType(type);
    }
    setCurrentTab('generator');
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'skl': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'undangan': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'tugas': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'pengantar': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'rekomendasi': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'pindahan': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-8 pb-16">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white overflow-hidden shadow-xl border border-indigo-900/30">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 flex items-center justify-center pointer-events-none">
          <School size={200} className="text-white" />
        </div>
        
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 animate-pulse">
            <Sparkles size={12} />
            Sistem Pembuat Surat Sekolah Otomatis
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Selamat Datang di Portal Persuratan
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Kelola dokumen, surat tugas, rekomendasi, dan undangan sekolah secara cepat, rapi, dan otomatis berdasarkan template standar kedinasan.
          </p>
          
          {settings && (
            <div className="pt-2 flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
              <School size={16} />
              <span>{settings.schoolName}</span>
              <span className="text-slate-500">|</span>
              <span>NPSN: {settings.npsn}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stat 1: Total Letters */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Surat Dibuat</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{letterCount}</h3>
          </div>
        </div>

        {/* Stat 2: Active Templates */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
            <Archive size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Arsip Tersimpan</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{letterCount}</h3>
          </div>
        </div>

        {/* Stat 3: School Profile Settings status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-amber-50 rounded-2xl text-amber-600">
            <School size={24} />
          </div>
          <div className="flex-grow">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profil Sekolah</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-extrabold text-slate-800 truncate max-w-[150px]">
                {settings?.schoolName ? 'Profil Aktif' : 'Belum Diatur'}
              </span>
              <button 
                onClick={() => setCurrentTab('settings')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
              >
                Ubah <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action and History Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Letter Templates (Left 2/3 on Desktop) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>Pilih Template Surat</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.values(LETTER_SCHEMAS).map((schema) => (
              <button
                key={schema.id}
                onClick={() => handleQuickCreate(schema.id)}
                className="bg-white hover:bg-slate-50 border border-slate-100 hover:border-indigo-100 text-left p-5 rounded-2xl shadow-sm hover:shadow transition-all group flex items-start gap-4 cursor-pointer"
              >
                <div className={`p-3 rounded-xl border flex-shrink-0 ${getBadgeColor(schema.id)}`}>
                  <FileText size={20} />
                </div>
                <div className="space-y-1 overflow-hidden">
                  <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-sm truncate">
                    {schema.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {schema.description}
                  </p>
                  <div className="text-[10px] text-slate-400 font-mono mt-2 pt-1 border-t border-slate-50">
                    Format: {schema.defaultRefPattern}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Letters List (Right 1/3 on Desktop) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Arsip Terkini</h2>
            <button 
              onClick={() => setCurrentTab('history')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
            >
              Lihat Semua <ChevronRight size={14} />
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
            {recentLetters.length > 0 ? (
              recentLetters.map((letter) => (
                <div key={letter.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3">
                  <div className="space-y-1 overflow-hidden">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${getBadgeColor(letter.type)}`}>
                      {letter.type}
                    </span>
                    <h5 className="font-bold text-slate-800 text-xs truncate" title={letter.title}>
                      {letter.recipientName || 'Tanpa Nama'}
                    </h5>
                    <p className="text-[10px] text-slate-400 font-mono truncate">
                      {letter.refNumber}
                    </p>
                    <div className="flex items-center gap-1 text-[9px] text-slate-400">
                      <Calendar size={10} />
                      <span>{formatIndonesianDate(letter.createdAt)}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (setSelectedLetterType) setSelectedLetterType(letter.type);
                      // Set search param or load directly to edit
                      // For now, let's navigate to history where they can trigger actions, or Generator with pre-loaded values
                      handleQuickCreate(letter.type);
                    }}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all flex-shrink-0"
                    title="Edit/Gunakan Kembali"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm flex flex-col items-center justify-center">
                <FileText size={36} className="text-slate-200 mb-2" />
                <span>Belum ada surat dibuat.</span>
                <button
                  onClick={() => handleQuickCreate('skl')}
                  className="mt-3 text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  Buat Surat Sekarang <ChevronRight size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
