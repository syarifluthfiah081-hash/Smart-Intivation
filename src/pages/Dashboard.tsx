import React, { useState, useEffect } from 'react';
import { getLetterHistory, getSchoolProfile } from '../services/storage';
import type { GeneratedLetter } from '../services/storage';
import { letterTemplates } from '../templates/letterTemplates';
import type { User } from '../services/auth';
import { FileText, ArrowRight, School, Printer, Award, Loader2 } from 'lucide-react';
import { formatDateIndo } from '../templates/letterTemplates';

interface DashboardProps {
  user: User;
  onNavigateToTab: (tab: 'create-letter' | 'master-data' | 'history', templateId?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigateToTab }) => {
  const [history, setHistory] = useState<GeneratedLetter[]>([]);
  const [schoolName, setSchoolName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [historyData, profileData] = await Promise.all([
          getLetterHistory(),
          getSchoolProfile(),
        ]);
        setHistory(historyData);
        setSchoolName(profileData.schoolName);
      } catch (err) {
        console.error('Gagal mengambil data dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const stats = [
    {
      label: 'Total Surat Diterbitkan',
      value: history.length,
      icon: FileText,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      label: 'Jenis Dokumen Aktif',
      value: letterTemplates.length,
      icon: Award,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      label: 'Nama Instansi Terdaftar',
      value: schoolName || 'Belum Diatur',
      icon: School,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
      isText: true,
    },
  ];

  // Ambil 3 surat terakhir untuk ringkasan aktivitas
  const recentLetters = history.slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs text-slate-500 font-semibold animate-pulse">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner Card */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        {/* Background decorative geometry */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none translate-x-12 -translate-y-12"></div>
        
        <div className="relative z-10 space-y-2 max-w-xl">
          <span className="text-[10px] bg-white/20 text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Sistem Siap Digunakan
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
            Selamat Datang Kembali, {user.fullName}!
          </h2>
          <p className="text-xs text-blue-100/90 leading-relaxed">
            Anda masuk sebagai <strong className="capitalize text-white">{user.role}</strong> di <strong>{schoolName || 'SMK NEGERI 2 KOTA TIDORE KEPULAUAN'}</strong>. Gunakan pintasan di bawah untuk membuat, mengedit seluruh teks surat secara bebas, dan mencetak dokumen dinas resmi.
          </p>

        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm"
            >
              <div className={`p-3 rounded-xl border ${stat.color} flex-shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {stat.label}
                </span>
                <h3 className={`font-extrabold tracking-tight mt-0.5 ${
                  stat.isText ? 'text-sm text-slate-800 truncate' : 'text-2xl text-slate-800'
                }`}>
                  {stat.value}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick shortcuts to letter templates */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            Pilih Template Dokumen & Surat
          </h3>
          <button
            onClick={() => onNavigateToTab('create-letter')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Semua Template</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {letterTemplates.map(template => (
            <button
              key={template.id}
              onClick={() => onNavigateToTab('create-letter', template.id)}
              className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-5 text-left transition-all duration-200 group flex flex-col justify-between h-40 shadow-sm cursor-pointer"
            >
              <div className="bg-slate-50 group-hover:bg-blue-50 border border-slate-200 group-hover:border-blue-100 p-2.5 rounded-xl w-fit text-slate-600 group-hover:text-blue-600 transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {template.name}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1">
                  Format Dinas A4 / F4
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity (History Preview) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            Aktivitas Terakhir (Riwayat Cetak)
          </h3>
          {history.length > 0 && (
            <button
              onClick={() => onNavigateToTab('history')}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Riwayat Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentLetters.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
            <Printer className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-400">Belum ada surat yang diterbitkan.</p>
            <button
              onClick={() => onNavigateToTab('create-letter')}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 mt-1 cursor-pointer"
            >
              Buat Surat Pertama Sekarang
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                  <th className="py-2.5">Jenis Dokumen</th>
                  <th className="py-2.5">Nomor Surat</th>
                  <th className="py-2.5">Ditujukan Kepada</th>
                  <th className="py-2.5">Tanggal Dibuat</th>
                  <th className="py-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {recentLetters.map(letter => (
                  <tr key={letter.id} className="border-b border-slate-100 text-slate-700 hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-semibold text-slate-800">{letter.typeName}</td>
                    <td className="py-3 font-mono">{letter.refNumber}</td>
                    <td className="py-3">{letter.recipientName}</td>
                    <td className="py-3 text-slate-500">{formatDateIndo(letter.dateCreated)}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onNavigateToTab('history')}
                        className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
