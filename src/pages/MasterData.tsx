import React, { useState, useEffect } from 'react';
import { getSchoolProfile, saveSchoolProfile } from '../services/storage';
import { LetterheadPreview, DEFAULT_SCHOOL_PROFILE } from '../components/LetterheadPreview';
import type { SchoolProfile } from '../components/LetterheadPreview';
import { LOGO_KIRI_DEFAULT, LOGO_KANAN_DEFAULT } from '../assets/defaultLogos';
import { BARCODE_KEPSEK_DEFAULT } from '../assets/defaultSignature';
import { Save, Upload, CheckCircle, Info, Loader2, RotateCcw, QrCode, Trash2 } from 'lucide-react';



export const MasterData: React.FC = () => {
  const [profile, setProfile] = useState<SchoolProfile>(DEFAULT_SCHOOL_PROFILE);

  const [toastMsg, setToastMsg] = useState('');
  const [logoKiriPreview, setLogoKiriPreview] = useState<string>(LOGO_KIRI_DEFAULT);
  const [logoKananPreview, setLogoKananPreview] = useState<string>(LOGO_KANAN_DEFAULT);
  const [barcodePreview, setBarcodePreview] = useState<string>(BARCODE_KEPSEK_DEFAULT);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load profile from Firestore / LocalStorage on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getSchoolProfile();
        const fullData = {
          ...DEFAULT_SCHOOL_PROFILE,
          ...data,
          logoUrl: data.logoUrl || LOGO_KIRI_DEFAULT,
          logoKananUrl: data.logoKananUrl || LOGO_KANAN_DEFAULT,
          signatureBarcodeUrl: data.signatureBarcodeUrl || BARCODE_KEPSEK_DEFAULT,
          useSignatureBarcode: data.useSignatureBarcode !== undefined ? data.useSignatureBarcode : true,
        };
        setProfile(fullData);
        setLogoKiriPreview(fullData.logoUrl || LOGO_KIRI_DEFAULT);
        setLogoKananPreview(fullData.logoKananUrl || LOGO_KANAN_DEFAULT);
        setBarcodePreview(fullData.signatureBarcodeUrl || BARCODE_KEPSEK_DEFAULT);
      } catch (err) {
        console.error('Gagal mengambil profil sekolah:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const processImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: 'kiri' | 'kanan'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Format file tidak didukung! Pilih berkas gambar dengan format PNG, JPG, atau JPEG.');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert('File logo terlalu besar! Maksimal ukuran logo adalah 2MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (side === 'kiri') {
          setLogoKiriPreview(base64);
          setProfile(prev => ({ ...prev, logoUrl: base64 }));
        } else {
          setLogoKananPreview(base64);
          setProfile(prev => ({ ...prev, logoKananUrl: base64 }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const processBarcodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Format file tidak didukung! Pilih berkas gambar dengan format PNG, JPG, atau JPEG.');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert('File barcode terlalu besar! Maksimal ukuran berkas adalah 2MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setBarcodePreview(base64);
        setProfile(prev => ({ 
          ...prev, 
          signatureBarcodeUrl: base64,
          useSignatureBarcode: true 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset data profil, logo & barcode tanda tangan ke format bawaan resmi SMK Negeri 2 Kota Tidore Kepulauan?')) {
      setProfile(DEFAULT_SCHOOL_PROFILE);
      setLogoKiriPreview(LOGO_KIRI_DEFAULT);
      setLogoKananPreview(LOGO_KANAN_DEFAULT);
      setBarcodePreview(BARCODE_KEPSEK_DEFAULT);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveSchoolProfile(profile);
      setToastMsg('Profil sekolah SMKN 2 Tikep berhasil disimpan!');
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      console.error('Gagal menyimpan profil sekolah:', err);
      alert('Gagal menyimpan profil sekolah ke database.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs text-slate-500 font-semibold animate-pulse">Memuat profil sekolah...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Profil Sekolah & Kop Surat</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi profil resmi SMK Negeri 2 Kota Tidore Kepulauan dan logo ganda permanen Kop Surat.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Profil SMKN 2 Tikep</span>
          </button>

          {toastMsg && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold shadow-sm animate-bounce">
              <CheckCircle className="w-4 h-4" />
              <span>{toastMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Form Editor Panel (Left 7 Columns) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            Formulir Profil Instansi
          </h3>

          <div className="space-y-4">
            {/* Dinas Pendidikan Hierarchy */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Dinas Pendidikan Atasan</label>
              <textarea
                name="deptName"
                rows={2}
                value={profile.deptName}
                onChange={handleChange}
                placeholder="PEMERINTAH DAERAH PROVINSI MALUKU UTARA&#10;DINAS PENDIDIKAN DAN KEBUDAYAAN"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl transition-all font-semibold uppercase"
              />
            </div>

            {/* Nama Sekolah & NPSN */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">Nama Satuan Pendidikan (Sekolah)</label>
                <input
                  type="text"
                  name="schoolName"
                  required
                  value={profile.schoolName}
                  onChange={handleChange}
                  placeholder="SMK NEGERI 2 KOTA TIDORE KEPULAUAN"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl transition-all font-bold uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">NPSN</label>
                <input
                  type="text"
                  name="npsn"
                  value={profile.npsn}
                  onChange={handleChange}
                  placeholder="60201509"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl transition-all"
                />
              </div>
            </div>

            {/* Alamat & Kodepos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-600 mb-1">Alamat Lengkap Sekolah</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={profile.address}
                  onChange={handleChange}
                  placeholder="Jl. Raya Soasio Rum Kel. Tomalou Kec. Tidore Selatan"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Kode Pos</label>
                <input
                  type="text"
                  name="postalCode"
                  value={profile.postalCode}
                  onChange={handleChange}
                  placeholder="97811"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl transition-all"
                />
              </div>
            </div>

            {/* Kontak: Telpon, Email, Website */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nomor Telpon</label>
                <input
                  type="text"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="-"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Email Resmi Sekolah</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="smkn2tikep@yahoo.com"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Website Sekolah</label>
                <input
                  type="text"
                  name="website"
                  value={profile.website}
                  onChange={handleChange}
                  placeholder="www.smkn2tikep.sch.id"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl transition-all"
                />
              </div>
            </div>

            {/* Pimpinan: Kepala Sekolah & NIP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nama Kepala Sekolah</label>
                <input
                  type="text"
                  name="principalName"
                  required
                  value={profile.principalName}
                  onChange={handleChange}
                  placeholder="Ali Djumati.S.Pd.,M.Si"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl transition-all font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">NIP Kepala Sekolah</label>
                <input
                  type="text"
                  name="principalNip"
                  required
                  value={profile.principalNip}
                  onChange={handleChange}
                  placeholder="1977601062003121005"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl transition-all font-mono font-medium"
                />
              </div>
            </div>

            {/* Dual Logos Upload & Management */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Logo Resmi Kop Surat (Ganda: Kiri & Kanan)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Logo Kiri (Hijau - Pemda / Daerah) */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <span className="text-[11px] font-bold text-slate-700 block">1. Logo Kiri (Warna Hijau - Pemda)</span>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl border border-slate-300 bg-white flex items-center justify-center overflow-hidden p-1 shadow-inner">
                      {logoKiriPreview ? (
                        <img src={logoKiriPreview} alt="Logo Kiri" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[9px] text-slate-400">No Logo</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-300 text-[11px] transition-all cursor-pointer shadow-sm">
                        <Upload className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Ganti Logo Kiri</span>
                        <input
                          type="file"
                          accept=".png, .jpg, .jpeg, .webp"
                          onChange={(e) => processImageUpload(e, 'kiri')}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setLogoKiriPreview(LOGO_KIRI_DEFAULT);
                          setProfile(p => ({ ...p, logoUrl: LOGO_KIRI_DEFAULT }));
                        }}
                        className="w-full text-center text-[10px] text-blue-600 hover:underline font-semibold"
                      >
                        Pakai Bawaan Hijau
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Logo Kanan (Biru - SMKN 2 Tidore Kepulauan) */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <span className="text-[11px] font-bold text-slate-700 block">2. Logo Kanan (Warna Biru - SMKN 2 Tikep)</span>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl border border-slate-300 bg-white flex items-center justify-center overflow-hidden p-1 shadow-inner">
                      {logoKananPreview ? (
                        <img src={logoKananPreview} alt="Logo Kanan" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[9px] text-slate-400">No Logo</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-300 text-[11px] transition-all cursor-pointer shadow-sm">
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>Ganti Logo Kanan</span>
                        <input
                          type="file"
                          accept=".png, .jpg, .jpeg, .webp"
                          onChange={(e) => processImageUpload(e, 'kanan')}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setLogoKananPreview(LOGO_KANAN_DEFAULT);
                          setProfile(p => ({ ...p, logoKananUrl: LOGO_KANAN_DEFAULT }));
                        }}
                        className="w-full text-center text-[10px] text-blue-600 hover:underline font-semibold"
                      >
                        Pakai Bawaan Biru
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Barcode TTD Kepala Sekolah (QR Code Otomatis) */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-blue-600" />
                    <span>Tanda Tangan Barcode / QR Kepala Sekolah</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Barcode QR resmi ini akan disisipkan secara otomatis dan rapi di area tanda tangan Kepala Sekolah pada seluruh surat.
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-[11px] font-bold text-slate-700">
                    {profile.useSignatureBarcode ? 'Barcode Aktif' : 'Nonaktif'}
                  </span>
                  <input
                    type="checkbox"
                    checked={profile.useSignatureBarcode !== false}
                    onChange={(e) => setProfile(p => ({ ...p, useSignatureBarcode: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </label>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Barcode Preview Box */}
                  <div className="w-24 h-24 rounded-xl border border-slate-300 bg-white flex flex-col items-center justify-center p-2 shadow-inner relative group flex-shrink-0">
                    {barcodePreview || profile.signatureBarcodeUrl ? (
                      <img 
                        src={barcodePreview || profile.signatureBarcodeUrl} 
                        alt="Barcode TTD Kepsek" 
                        className="w-full h-full object-contain" 
                      />
                    ) : (
                      <div className="text-center text-slate-400">
                        <QrCode className="w-8 h-8 mx-auto stroke-1" />
                        <span className="text-[8px] block mt-1">Belum Ada</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-300 text-xs transition-all cursor-pointer shadow-sm">
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>Unggah Barcode Baru</span>
                        <input
                          type="file"
                          accept=".png, .jpg, .jpeg, .webp"
                          onChange={processBarcodeUpload}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          setBarcodePreview(BARCODE_KEPSEK_DEFAULT);
                          setProfile(p => ({ ...p, signatureBarcodeUrl: BARCODE_KEPSEK_DEFAULT, useSignatureBarcode: true }));
                        }}
                        className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 text-xs transition-all cursor-pointer"
                      >
                        Gunakan Barcode Bawaan
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setBarcodePreview('');
                          setProfile(p => ({ ...p, signatureBarcodeUrl: '', useSignatureBarcode: false }));
                        }}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg border border-rose-200 text-xs transition-all cursor-pointer flex items-center gap-1"
                        title="Kosongkan barcode (pakai ttd fisik kosong)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Kosongkan</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Format disarankan: PNG persegi (1:1) dengan resolusi jelas. Tanda tangan QR akan tampak proporsional pada pratinjau, PDF, Word, dan cetak langsung.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t border-slate-100 pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold rounded-xl shadow-md hover:shadow-blue-500/20 transition-all cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Profil Sekolah</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Real-time Kop Surat Preview (Right 5 Columns) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
          <div className="bg-slate-100 p-4 border border-slate-200 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Live Kop Surat Preview</h4>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Resmi</span>
            </div>
            <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm overflow-x-auto">
              <div className="w-[180mm] bg-white origin-top-left scale-[0.55] md:scale-[0.50] lg:scale-[0.45] xl:scale-[0.50] h-[60mm] -mb-[26mm] md:-mb-[30mm] lg:-mb-[33mm] xl:-mb-[30mm]">
                <LetterheadPreview profile={profile} />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 text-blue-900 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">SMKN 2 Kota Tidore Kepulauan</p>
              <p className="mt-0.5 text-blue-800 text-[11px]">
                Profil dan logo ini tersimpan permanen dan secara otomatis terpasang pada seluruh format dokumen persuratan, cetak langsung, serta ekspor PDF/Word.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
