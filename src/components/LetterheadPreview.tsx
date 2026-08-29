import React, { useState, useEffect } from 'react';
import { School } from 'lucide-react';
import { removeBlackBackground } from '../utils/imageProcess';
import { LOGO_KIRI_DEFAULT, LOGO_KANAN_DEFAULT } from '../assets/defaultLogos';

export interface SchoolProfile {
  schoolName: string;
  foundationName?: string;
  deptName?: string;
  npsn: string;
  address: string;
  postalCode?: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string; // Logo Kiri (Hijau - Pemda Maluku Utara / Tidore)
  logoKananUrl?: string; // Logo Kanan (Biru - SMK Negeri 2 Kota Tidore Kepulauan)
  principalName: string;
  principalNip: string;
}

export const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  schoolName: 'SMK NEGERI 2 KOTA TIDORE KEPULAUAN',
  foundationName: '',
  deptName: 'PEMERINTAH PROVINSI MALUKU UTARA\nDINAS PENDIDIKAN DAN KEBUDAYAAN',
  npsn: '60201509',
  address: 'Jln.Raya Soasio-Rum Kel.Tomalou Kec.Tidore Selatan',
  postalCode: '',
  phone: '',
  email: 'smkn2tidore@yahoo.com',
  website: '',
  logoUrl: LOGO_KIRI_DEFAULT,
  logoKananUrl: LOGO_KANAN_DEFAULT,
  principalName: 'Ali Djumati.S.Pd.,M.Si',
  principalNip: '1977601062003121005',
};

interface LetterheadPreviewProps {
  profile?: Partial<SchoolProfile>;
}

export const LetterheadPreview: React.FC<LetterheadPreviewProps> = ({ profile }) => {
  const data: SchoolProfile = {
    ...DEFAULT_SCHOOL_PROFILE,
    ...profile,
    logoUrl: profile?.logoUrl !== undefined && profile?.logoUrl !== '' ? profile.logoUrl : LOGO_KIRI_DEFAULT,
    logoKananUrl: profile?.logoKananUrl !== undefined && profile?.logoKananUrl !== '' ? profile.logoKananUrl : LOGO_KANAN_DEFAULT,
  };

  const [processedLogoKiri, setProcessedLogoKiri] = useState<string>('');
  const [processedLogoKanan, setProcessedLogoKanan] = useState<string>('');

  useEffect(() => {
    if (data.logoUrl) {
      removeBlackBackground(data.logoUrl).then(cleanedUrl => {
        setProcessedLogoKiri(cleanedUrl);
      });
    } else {
      setProcessedLogoKiri('');
    }
  }, [data.logoUrl]);

  useEffect(() => {
    if (data.logoKananUrl) {
      removeBlackBackground(data.logoKananUrl).then(cleanedUrl => {
        setProcessedLogoKanan(cleanedUrl);
      });
    } else {
      setProcessedLogoKanan('');
    }
  }, [data.logoKananUrl]);

  return (
    <div className="w-full bg-white select-none">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 no-print text-[10px] text-slate-400">
        <span className="font-semibold text-slate-500">Kop Surat Resmi SMKN 2 Kota Tidore Kepulauan</span>
      </div>

      <div className="flex items-center justify-between gap-2 text-black font-serif">
        {/* Left Logo (Hijau - Pemda / Provinsi Maluku Utara) */}
        <div className="w-[72px] h-[72px] flex-shrink-0 flex items-center justify-center bg-white overflow-hidden">
          {processedLogoKiri || data.logoUrl ? (
            <img 
              src={processedLogoKiri || data.logoUrl} 
              alt="Logo Pemda (Kiri)" 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center text-slate-400 print:text-black">
              <School className="w-7 h-7 stroke-[1.5]" />
              <span className="text-[7px] font-sans no-print">Logo Kiri</span>
            </div>
          )}
        </div>

        {/* Center Text Section */}
        <div className="flex-1 text-center px-1 font-serif">
          {data.foundationName && (
            <h4 className="text-[12px] uppercase font-bold leading-snug tracking-normal text-black">
              {data.foundationName}
            </h4>
          )}
          {data.deptName && (
            <div className="text-[12px] md:text-[13px] uppercase font-bold leading-tight whitespace-pre-line tracking-normal text-black">
              {data.deptName}
            </div>
          )}
          <h3 className="text-[13.5px] md:text-[14.5px] uppercase font-bold leading-tight tracking-normal mt-0.5 text-black">
            {data.schoolName}
          </h3>
          <p className="text-[10px] md:text-[10.5px] leading-tight mt-0.5 font-normal text-black font-serif">
            <span>{data.address || 'Jln.Raya Soasio-Rum Kel.Tomalou Kec.Tidore Selatan'}</span>
            {data.email && (
              <span className="ml-2 font-serif">
                <em>E-Maile:</em>{data.email}
              </span>
            )}
          </p>
        </div>

        {/* Right Logo (Biru - SMKN 2 Tidore Kepulauan) */}
        <div className="w-[72px] h-[72px] flex-shrink-0 flex items-center justify-center bg-white overflow-hidden">
          {processedLogoKanan || data.logoKananUrl ? (
            <img 
              src={processedLogoKanan || data.logoKananUrl} 
              alt="Logo SMKN 2 Tikep (Kanan)" 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center text-slate-400 print:text-black">
              <School className="w-7 h-7 stroke-[1.5]" />
              <span className="text-[7px] font-sans no-print">Logo Kanan</span>
            </div>
          )}
        </div>
      </div>

      {/* Double Border Line Formal Kop Surat Sesuai Foto Resmi */}
      <div className="kop-line"></div>
    </div>
  );
};
