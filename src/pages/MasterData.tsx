import React, { useState, useEffect } from 'react';
import { getSchoolProfile, saveSchoolProfile } from '../services/storage';
import { LetterheadPreview } from '../components/LetterheadPreview';
import type { SchoolProfile } from '../components/LetterheadPreview';
import { Save, Upload, Trash2, CheckCircle, Info, Loader2 } from 'lucide-react';

export const MasterData: React.FC = () => {
  const [profile, setProfile] = useState<SchoolProfile>({
    schoolName: '',
    foundationName: '',
    deptName: '',
    npsn: '',
    address: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    logoUrl: '',
    principalName: '',
    principalNip: '',
  });

  const [toastMsg, setToastMsg] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load profile from Firestore on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getSchoolProfile();
        setProfile(data);
        if (data.logoUrl) {
          setLogoPreview(data.logoUrl);
        }
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert('Format file tidak didukung! Pilih berkas gambar dengan format PNG, JPG, atau JPEG.');
        return;
      }

      if (file.size > 1024 * 1024) {
        alert('File logo terlalu besar! Maksimal ukuran logo adalah 1MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 200; // Resizing to max 200px for optimal storage and Kop layout
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxDim) {
              height = Math.round(height * maxDim / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round(width * maxDim / height);
              height = maxDim;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            
            // Clean solid black or near-black background on upload
            const imgData = ctx.getImageData(0, 0, width, height);
            const dataArr = imgData.data;
            const isNearBlack = (r: number, g: number, b: number, a: number): boolean => {
              if (a < 10) return false;
              return r < 50 && g < 50 && b < 50;
            };
            
            const visited = new Uint8Array(width * height);
            const queue: [number, number][] = [];
            const pushPixel = (x: number, y: number) => {
              const idx = y * width + x;
              if (!visited[idx]) {
                const pixelIdx = idx * 4;
                if (isNearBlack(dataArr[pixelIdx], dataArr[pixelIdx + 1], dataArr[pixelIdx + 2], dataArr[pixelIdx + 3])) {
                  visited[idx] = 1;
                  queue.push([x, y]);
                }
              }
            };
            
            // Seed BFS queue with border pixels
            for (let x = 0; x < width; x++) {
              pushPixel(x, 0);
              pushPixel(x, height - 1);
            }
            for (let y = 0; y < height; y++) {
              pushPixel(0, y);
              pushPixel(width - 1, y);
            }
            
            let head = 0;
            while (head < queue.length) {
              const [cx, cy] = queue[head++];
              const idx = (cy * width + cx) * 4;
              dataArr[idx + 3] = 0; // Set alpha to transparent
              
              const neighbors = [
                [cx + 1, cy],
                [cx - 1, cy],
                [cx, cy + 1],
                [cx, cy - 1]
              ];
              for (const [nx, ny] of neighbors) {
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                  const nidx = ny * width + nx;
                  if (!visited[nidx]) {
                    const pixelIdx = nidx * 4;
                    if (isNearBlack(dataArr[pixelIdx], dataArr[pixelIdx + 1], dataArr[pixelIdx + 2], dataArr[pixelIdx + 3])) {
                      visited[nidx] = 1;
                      queue.push([nx, ny]);
                    }
                  }
                }
              }
            }
            ctx.putImageData(imgData, 0, 0);

            // Always save as transparent PNG to preserve transparency
            const compressedBase64 = canvas.toDataURL('image/png');
            setLogoPreview(compressedBase64);
            setProfile(prev => ({
              ...prev,
              logoUrl: compressedBase64,
            }));
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    setProfile(prev => ({
      ...prev,
      logoUrl: '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveSchoolProfile(profile);
      setToastMsg('Profil sekolah berhasil disimpan!');
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
          <h2 className="text-xl font-extrabold text-slate-800">Profil Sekolah (Kop Surat)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi profil instansi sekolah yang akan otomatis disematkan pada Kop Surat seluruh dokumen.
          </p>
        </div>

        {/* Saved Alert Toast */}
        {toastMsg && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold shadow-sm animate-bounce">
            <CheckCircle className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        )}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Form Editor Panel (Left 7 Columns) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            Formulir Profil Sekolah
          </h3>

          <div className="space-y-4">
            {/* Yayasan (Opsional) */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nama Yayasan / Lembaga (Opsional)</label>
              <input
                type="text"
                name="foundationName"
                value={profile.foundationName}
                onChange={handleChange}
                placeholder="Misal: YAYASAN PENDIDIKAN DHARMA PERTIWI"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl transition-all"
              />
            </div>

            {/* Dinas Pendidikan Hierarchy */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Dinas Pendidikan Atasan</label>
              <textarea
                name="deptName"
                rows={2}
                value={profile.deptName}
                onChange={handleChange}
                placeholder="Misal: PEMERINTAH PROVINSI BALI&#10;DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl transition-all"
              />
            </div>

            {/* Nama Sekolah & NPSN */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">Nama Sekolah Utama</label>
                <input
                  type="text"
                  name="schoolName"
                  required
                  value={profile.schoolName}
                  onChange={handleChange}
                  placeholder="Misal: SMA NEGERI 1 DENPASAR"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">NPSN</label>
                <input
                  type="text"
                  name="npsn"
                  required
                  value={profile.npsn}
                  onChange={handleChange}
                  placeholder="Misal: 50123456"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl transition-all"
                />
              </div>
            </div>

            {/* Alamat & Kodepos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-600 mb-1">Alamat Jalan Lengkap</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={profile.address}
                  onChange={handleChange}
                  placeholder="Misal: Jl. Kamboja No. 12, Denpasar Utara"
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
                  placeholder="80233"
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
                  required
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="(0361) 222333"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Email Sekolah</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="info@sman1dps.sch.id"
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
                  placeholder="www.sman1dps.sch.id"
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
                  placeholder="Misal: Drs. I Wayan Sukarta, M.Pd."
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl transition-all"
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
                  placeholder="Misal: 196805121995031004"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl transition-all"
                />
              </div>
            </div>

            {/* Logo Upload */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-600 mb-2">Logo Resmi Sekolah</label>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-20 h-20 rounded-xl border border-slate-200 flex items-center justify-center bg-white overflow-hidden relative shadow-inner">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-semibold">No Logo</span>
                  )}
                </div>
                <div className="flex-1 flex gap-2">
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200 text-xs transition-all cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Pilih Berkas Logo</span>
                    <input
                      type="file"
                      accept=".png, .jpg, .jpeg"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>

                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl border border-rose-100 text-xs transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                Format yang didukung: PNG, JPG, GIF. Ukuran maksimum berkas: 1MB. Resolusi ideal: 300x300 piksel.
              </p>
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
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          <div className="bg-slate-100 p-4 border border-slate-200 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Live Preview Kop Surat</h4>
              <span className="text-[9px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">Real-time</span>
            </div>
            <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-sm overflow-x-auto">
              {/* Scale down slightly to fit preview cleanly in sidebar */}
              <div className="w-[180mm] bg-white origin-top-left scale-[0.55] md:scale-[0.52] lg:scale-[0.45] xl:scale-[0.52] h-[60mm] -mb-[26mm] md:-mb-[28mm] lg:-mb-[32mm] xl:-mb-[28mm]">
                <LetterheadPreview profile={profile} />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Info Singkat Dinas</p>
              <p className="mt-0.5 text-blue-700">
                Pemerintah Provinsi Dinas Pendidikan biasanya ditulis pada baris atas Kop Surat sebelum nama sekolah. Pastikan data pimpinan (Nama & NIP) diisi lengkap untuk pembubuhan tanda tangan otomatis pada surat yang diterbitkan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
