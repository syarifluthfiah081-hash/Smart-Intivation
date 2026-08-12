import React, { useState, useEffect } from 'react';
import { db, seedDefaultSettings, type SchoolSettings } from '../services/db';
import { Save, Upload, School, UserCheck, ShieldAlert, CheckCircle } from 'lucide-react';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await seedDefaultSettings();
        setSettings(data);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!settings) return;
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: value,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'signatureUrl') => {
    if (!settings || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (file.size > 2 * 1024 * 1024) { // limit 2MB
      setAlert({
        type: 'error',
        message: 'Ukuran file gambar tidak boleh melebihi 2MB!',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target && typeof event.target.result === 'string') {
        setSettings({
          ...settings,
          [field]: event.target.result,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      if (settings.id) {
        await db.settings.put(settings);
      } else {
        await db.settings.add(settings);
      }
      setAlert({
        type: 'success',
        message: 'Pengaturan profil sekolah berhasil disimpan!',
      });
      setTimeout(() => setAlert(null), 4000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setAlert({
        type: 'error',
        message: 'Gagal menyimpan pengaturan sekolah.',
      });
    }
  };

  const removeImage = (field: 'logoUrl' | 'signatureUrl') => {
    if (!settings) return;
    setSettings({
      ...settings,
      [field]: '',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 pb-16">
      {/* Page Title */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Pengaturan Master Data Sekolah</h1>
          <p className="text-sm text-slate-500">Sesuaikan profil sekolah, kepala sekolah, logo, dan tanda tangan digital untuk kop surat otomatis.</p>
        </div>
      </div>

      {/* Success/Error Alerts */}
      {alert && (
        <div 
          className={`flex items-center gap-3 p-4 mb-6 rounded-xl border ${
            alert.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {alert.type === 'success' ? <CheckCircle size={20} /> : <ShieldAlert size={20} />}
          <span className="text-sm font-semibold">{alert.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: School Identity */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-indigo-600">
            <School size={20} />
            <h2 className="text-lg font-bold text-slate-800">Identitas Sekolah</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nama Resmi Sekolah</label>
              <input
                type="text"
                name="schoolName"
                value={settings?.schoolName || ''}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">NPSN</label>
              <input
                type="text"
                name="npsn"
                value={settings?.npsn || ''}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Instansi Pembina (Ditulis per Baris)</label>
            <textarea
              name="governingBody"
              value={settings?.governingBody || ''}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
              placeholder="PEMERINTAH PROVINSI JAWA BARAT&#10;DINAS PENDIDIKAN"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">Gunakan baris baru (Enter) untuk memisahkan struktur tingkat atas di Kop Surat.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Alamat Lengkap Sekolah</label>
            <input
              type="text"
              name="address"
              value={settings?.address || ''}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
              placeholder="Jalan Belitung No. 8, Merdeka, Kec. Sumur Bandung, Kota Bandung"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Kode Pos</label>
              <input
                type="text"
                name="postCode"
                value={settings?.postCode || ''}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Telepon Sekolah</label>
              <input
                type="text"
                name="phone"
                value={settings?.phone || ''}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Resmi</label>
              <input
                type="email"
                name="email"
                value={settings?.email || ''}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Website</label>
              <input
                type="text"
                name="website"
                value={settings?.website || ''}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 2: School Head (Principal Profile) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-indigo-600">
            <UserCheck size={20} />
            <h2 className="text-lg font-bold text-slate-800">Profil Kepala Sekolah</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nama Kepala Sekolah (Lengkap + Gelar)</label>
              <input
                type="text"
                name="principalName"
                value={settings?.principalName || ''}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                placeholder="Drs. H. Maman Suherman, M.Pd."
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">NIP Kepala Sekolah</label>
              <input
                type="text"
                name="principalNip"
                value={settings?.principalNip || ''}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                placeholder="19680324 199303 1 002"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Pangkat / Golongan</label>
              <input
                type="text"
                name="principalRank"
                value={settings?.principalRank || ''}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                placeholder="Pembina Utama Muda, IV/c"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Media Uploads (Logo & Stamp / Signature) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 pb-3 border-b border-slate-100 mb-6">Logo Sekolah & Tanda Tangan</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Logo School */}
            <div className="flex flex-col items-center p-4 border border-slate-100 rounded-2xl bg-slate-50">
              <span className="text-sm font-bold text-slate-700 mb-4">Logo Resmi Sekolah</span>
              
              <div className="w-32 h-32 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center bg-white relative overflow-hidden group shadow-inner">
                {settings?.logoUrl ? (
                  <>
                    <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                    <button
                      type="button"
                      onClick={() => removeImage('logoUrl')}
                      className="absolute inset-0 bg-black/60 text-white font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      Hapus Logo
                    </button>
                  </>
                ) : (
                  <div className="text-slate-300 flex flex-col items-center">
                    <School size={36} className="mb-2" />
                    <span className="text-[10px] text-slate-400">Kosong</span>
                  </div>
                )}
              </div>

              <label className="mt-4 flex items-center gap-2 px-4 py-2 border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 shadow-sm shadow-indigo-600/10">
                <Upload size={14} />
                Unggah Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'logoUrl')}
                  className="hidden"
                />
              </label>
              <p className="text-[9px] text-slate-400 mt-2 text-center">Format PNG / JPG. Maksimal file 2MB.</p>
            </div>

            {/* Stamp & Signature */}
            <div className="flex flex-col items-center p-4 border border-slate-100 rounded-2xl bg-slate-50">
              <span className="text-sm font-bold text-slate-700 mb-4">Tanda Tangan & Cap Kepala Sekolah</span>
              
              <div className="w-32 h-32 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center bg-white relative overflow-hidden group shadow-inner">
                {settings?.signatureUrl ? (
                  <>
                    <img src={settings.signatureUrl} alt="Tanda Tangan" className="w-full h-full object-contain p-2" />
                    <button
                      type="button"
                      onClick={() => removeImage('signatureUrl')}
                      className="absolute inset-0 bg-black/60 text-white font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      Hapus Tanda Tangan
                    </button>
                  </>
                ) : (
                  <div className="text-slate-300 flex flex-col items-center">
                    <Upload size={36} className="mb-2" />
                    <span className="text-[10px] text-slate-400">Kosong</span>
                  </div>
                )}
              </div>

              <label className="mt-4 flex items-center gap-2 px-4 py-2 border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 shadow-sm shadow-indigo-600/10">
                <Upload size={14} />
                Unggah Tanda Tangan
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'signatureUrl')}
                  className="hidden"
                />
              </label>
              <p className="text-[9px] text-slate-400 mt-2 text-center">Format PNG (transparan sangat disarankan) / JPG.</p>
            </div>
          </div>
        </div>

        {/* Form Action Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Save size={16} />
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
};
