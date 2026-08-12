import React, { useState, useEffect } from 'react';
import { db, seedDefaultSettings, type GeneratedLetter, type SchoolSettings } from '../services/db';
import { LETTER_SCHEMAS, formatIndonesianDate } from '../templates';
import { LetterPreview } from '../components/LetterPreview';
import { 
  Search, 
  Trash2, 
  Printer, 
  FileEdit, 
  Filter, 
  FileText, 
  AlertCircle
} from 'lucide-react';

interface HistoryProps {
  setCurrentTab: (tab: string) => void;
  setSelectedLetterType: (type: any) => void;
  setEditLetterData: (data: any) => void;
}

export const History: React.FC<HistoryProps> = ({
  setCurrentTab,
  setSelectedLetterType,
  setEditLetterData,
}) => {
  const [letters, setLetters] = useState<GeneratedLetter[]>([]);
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // States for deleting confirmation modal
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  // States for quick printing
  const [printLetter, setPrintLetter] = useState<GeneratedLetter | null>(null);

  useEffect(() => {
    loadLetters();
  }, []);

  const loadLetters = async () => {
    try {
      const data = await db.letters.orderBy('id').reverse().toArray();
      setLetters(data);
      const schoolData = await seedDefaultSettings();
      setSettings(schoolData);
    } catch (e) {
      console.error('Failed to load archives:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await db.letters.delete(deleteId);
      setLetters(letters.filter(l => l.id !== deleteId));
      setDeleteId(null);
    } catch (e) {
      console.error('Failed to delete letter:', e);
    }
  };

  const handleEdit = (letter: GeneratedLetter) => {
    setSelectedLetterType(letter.type);
    setEditLetterData(letter);
    setCurrentTab('generator');
  };

  const handleDirectPrint = (letter: GeneratedLetter) => {
    setPrintLetter(letter);
    // Wait briefly for preview DOM rendering, then trigger print
    setTimeout(() => {
      window.print();
      setPrintLetter(null);
    }, 300);
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

  const filteredLetters = letters.filter(l => {
    const matchesSearch = 
      l.recipientName?.toLowerCase().includes(search.toLowerCase()) ||
      l.refNumber?.toLowerCase().includes(search.toLowerCase()) ||
      l.title?.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === 'all' || l.type === typeFilter;

    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 pb-16">
      {/* Printable Area - Rendered off-screen and only visible during @media print */}
      {printLetter && settings && (
        <div className="hidden print:block absolute left-0 top-0 w-full z-50">
          <LetterPreview 
            type={printLetter.type} 
            formData={printLetter.formData} 
            settings={settings}
            paperSize={printLetter.formData.paperSize || 'a4'}
            fontFamily={printLetter.formData.fontFamily || 'serif'}
          />
        </div>
      )}

      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 mb-6 gap-4 no-print">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Arsip & Riwayat Surat</h1>
          <p className="text-sm text-slate-500">Cari, filter, cetak ulang, atau modifikasi surat-surat resmi sekolah yang telah diterbitkan.</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 mb-6 no-print">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama penerima, nomor surat, perihal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
          />
        </div>

        {/* Filter Type */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Filter size={16} className="text-slate-500" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-semibold text-slate-700"
          >
            <option value="all">Semua Jenis Surat</option>
            {Object.values(LETTER_SCHEMAS).map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Archive Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden no-print">
        {filteredLetters.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-slate-50/75 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4 text-left">Jenis Surat</th>
                  <th className="px-6 py-4 text-left">Nomor Surat</th>
                  <th className="px-6 py-4 text-left">Penerima</th>
                  <th className="px-6 py-4 text-left">Tanggal Buat</th>
                  <th className="px-6 py-4 text-center w-40">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredLetters.map((letter) => (
                  <tr key={letter.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Badge Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${getBadgeColor(letter.type)}`}>
                        {letter.type}
                      </span>
                    </td>
                    
                    {/* Ref Num Column */}
                    <td className="px-6 py-4 font-mono font-medium text-slate-600 max-w-[200px] truncate" title={letter.refNumber}>
                      {letter.refNumber}
                    </td>

                    {/* Recipient Column */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{letter.recipientName || '-'}</div>
                      <div className="text-xs text-slate-400 truncate max-w-[220px]">
                        {letter.recipientDetail || '-'}
                      </div>
                    </td>

                    {/* Date Column */}
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {formatIndonesianDate(letter.createdAt)}
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleDirectPrint(letter)}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                          title="Cetak Surat"
                        >
                          <Printer size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(letter)}
                          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all cursor-pointer"
                          title="Gunakan Kembali / Edit"
                        >
                          <FileEdit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteId(letter.id || null)}
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                          title="Hapus dari Arsip"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 px-4 text-slate-400">
            <FileText size={48} className="mx-auto text-slate-200 mb-3" />
            <p className="font-semibold text-slate-700">Tidak ada surat ditemukan</p>
            <p className="text-xs mt-1 text-slate-400">Coba ubah kata kunci pencarian atau buat surat baru.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-rose-500 bg-rose-50 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <AlertCircle size={24} />
            </div>
            
            <h3 className="text-lg font-bold text-slate-800">Hapus Surat dari Arsip?</h3>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              Tindakan ini permanen. Surat yang dihapus tidak dapat dipulihkan kembali dari basis data lokal.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
