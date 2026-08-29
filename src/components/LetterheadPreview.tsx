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
  logoUrl?: string; // Logo Kiri (Hijau - Pemda / Provinsi / Daerah)
  logoKananUrl?: string; // Logo Kanan (Biru - SMK Negeri 2 Kota Tidore Kepulauan)
  principalName: string;
  principalNip: string;
}

export const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  schoolName: 'SMK NEGERI 2 KOTA TIDORE KEPULAUAN',
  foundationName: '',
  deptName: 'PEMERINTAH DAERAH PROVINSI MALUKU UTARA\nDINAS PENDIDIKAN DAN KEBUDAYAAN',
  npsn: '60201509',
  address: 'Jl. Raya Soasio Rum Kel. Tomalou Kec. Tidore Selatan',
  postalCode: '97811',
  phone: '-',
  email: 'smkn2tikep@yahoo.com',
  website: 'www.smkn2tikep.sch.id',
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
        <span className="font-semibold text-slate-500">Kop Surat Resmi SMKN 2 Tidore Kepulauan (Logo Ganda Kiri & Kanan)</span>
      </div>

      <div className="flex items-center justify-between gap-3 text-black font-serif">
        {/* Left Logo (Hijau / Pemda) */}
        <div className="w-[75px] h-[75px] flex-shrink-0 flex items-center justify-center bg-white overflow-hidden">
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
        <div className="flex-1 text-center px-1">
          {data.foundationName && (
            <h4 className="text-[11px] uppercase font-semibold leading-tight tracking-wider">
              {data.foundationName}
            </h4>
          )}
          {data.deptName && (
            <div className="text-[10px] md:text-[11px] uppercase font-bold leading-snug whitespace-pre-line tracking-wide">
              {data.deptName}
            </div>
          )}
          <h3 className="text-sm md:text-base uppercase font-extrabold leading-snug tracking-wider mt-0.5 text-black">
            {data.schoolName}
          </h3>
          <p className="text-[9px] md:text-[9.5px] leading-tight font-sans mt-0.5 font-normal">
            {data.address} {data.postalCode && `Kode Pos ${data.postalCode}`}
          </p>
          {(data.email || data.website || data.phone !== '-') && (
            <p className="text-[8.5px] md:text-[9px] leading-tight font-sans text-slate-700">
              {data.phone && data.phone !== '-' && `Telp: ${data.phone} `}
              {data.email && `Email: ${data.email}`}
              {data.website && ` | Web: ${data.website}`}
            </p>
          )}
        </div>

        {/* Right Logo (Biru / SMK N 2 Tidore Kepulauan) */}
        <div className="w-[75px] h-[75px] flex-shrink-0 flex items-center justify-center bg-white overflow-hidden">
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

      {/* Double Border Line Formal */}
      <div className="kop-line"></div>
    </div>
  );
};
