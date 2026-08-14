import React, { useState, useEffect } from 'react';
import { getLetterHistory, deleteLetterFromHistory } from '../services/storage';
import type { GeneratedLetter } from '../services/storage';
import { letterTemplates, formatDateIndo } from '../templates/letterTemplates';
import { Search, Filter, Trash2, Edit, FileText, Calendar, Loader2 } from 'lucide-react';

interface HistoryProps {
  onEditLetter: (letter: GeneratedLetter) => void;
}

export const HistoryPage: React.FC<HistoryProps> = ({ onEditLetter }) => {
  const [history, setHistory] = useState<GeneratedLetter[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const data = await getLetterHistory();
      setHistory(data);
    } catch (err) {
      console.error('Gagal memuat riwayat surat:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus surat ini dari riwayat?')) {
      setLoading(true);
      try {
        await deleteLetterFromHistory(id);
        await fetchHistory();
      } catch (err) {
        console.error('Gagal menghapus surat:', err);
        alert('Gagal menghapus surat dari database.');
        setLoading(false);
      }
    }
  };

  // Filter & Search Logic
  const filteredHistory = history.filter(letter => {
    const matchesSearch =
      letter.recipientName.toLowerCase().includes(search.toLowerCase()) ||
      letter.refNumber.toLowerCase().includes(search.toLowerCase()) ||
      letter.typeName.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = filterType === 'all' || letter.typeId === filterType;

    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs text-slate-500 font-semibold animate-pulse">Memuat riwayat surat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800">Riwayat Penerbitan Surat</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Daftar seluruh dokumen sekolah yang telah di-generate. Anda dapat mengedit kembali variabel surat atau mencetaknya ulang.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        {/* Search */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama penerima, nomor surat, atau jenis dokumen..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl text-xs transition-all"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl text-xs transition-all"
          >
            <option value="all">Semua Tipe Surat</option>
            {letterTemplates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* History List Grid / Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-500">Tidak ada riwayat ditemukan</h4>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau tipe filter Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                  <th className="px-6 py-4">Dokumen</th>
                  <th className="px-6 py-4">Nomor Surat</th>
                  <th className="px-6 py-4">Penerima</th>
                  <th className="px-6 py-4">Tanggal Dibuat</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredHistory.map((letter) => (
                  <tr key={letter.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Dokumen Name */}
                    <td className="px-6 py-4 font-bold text-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span>{letter.typeName}</span>
                          {/* Variabel Pendukung */}
                          <div className="text-[10px] text-slate-400 font-normal mt-0.5 line-clamp-1 max-w-[250px]">
                            {Object.entries(letter.variables)
                              .filter(([k]) => k !== 'nomor' && k !== 'tanggal_surat' && k !== 'perihal')
                              .map(([k, v]) => `${k.replace('_', ' ')}: ${v}`)
                              .join(' | ')}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Nomor Surat */}
                    <td className="px-6 py-4 font-mono text-slate-600">{letter.refNumber}</td>
                    
                    {/* Penerima */}
                    <td className="px-6 py-4 font-medium">{letter.recipientName}</td>
                    
                    {/* Tanggal Dibuat */}
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDateIndo(letter.dateCreated)}</span>
                      </div>
                    </td>

                    {/* Aksi */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit & Load */}
                        <button
                          onClick={() => onEditLetter(letter)}
                          title="Edit & Cetak Ulang"
                          className="flex items-center justify-center p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-100 transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Hapus */}
                        <button
                          onClick={() => handleDelete(letter.id)}
                          title="Hapus dari Riwayat"
                          className="flex items-center justify-center p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-100 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
