import React from 'react';
import { School } from 'lucide-react';

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
  logoUrl?: string; // Base64 or standard URL
  principalName: string;
  principalNip: string;
}

interface LetterheadPreviewProps {
  profile?: Partial<SchoolProfile>;
}

export const LetterheadPreview: React.FC<LetterheadPreviewProps> = ({ profile }) => {
  // Default fallback data for preview if profile is not fully filled
  const defaultProfile: SchoolProfile = {
    schoolName: 'SMA NEGERI 1 MERDEKA',
    foundationName: '',
    deptName: 'PEMERINTAH PROVINSI DKI JAKARTA\nDINAS PENDIDIKAN',
    npsn: '12345678',
    address: 'Jl. Merdeka Raya No. 10, Gambir, Jakarta Pusat',
    postalCode: '10110',
    phone: '(021) 1234567',
    email: 'info@sman1merdeka.sch.id',
    website: 'www.sman1merdeka.sch.id',
    logoUrl: '',
    principalName: 'Drs. H. Ahmad Wijaya, M.Pd.',
    principalNip: '197508212003121002',
  };

  const data = { ...defaultProfile, ...profile };

  return (
    <div className="w-full bg-white select-none">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 no-print text-[10px] text-slate-400">
        <span>Pratinjau Kop Surat Resmi (A4)</span>
      </div>

      <div className="flex items-center gap-4 text-black font-serif">
        {/* Logo Section */}
        <div className="w-[80px] h-[80px] flex-shrink-0 flex items-center justify-center border border-dashed border-slate-300 rounded bg-white overflow-hidden print:border-none print:bg-transparent">
          {data.logoUrl ? (
            <img 
              src={data.logoUrl} 
              alt="Logo Sekolah" 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center text-slate-400 print:text-black">
              <School className="w-8 h-8 stroke-[1.5]" />
              <span className="text-[8px] font-sans mt-0.5 no-print">Tanpa Logo</span>
            </div>
          )}
        </div>

        {/* Text Section */}
        <div className="flex-1 text-center pr-[40px]"> {/* pr-10 to offset the left logo for balance */}
          {data.foundationName && (
            <h4 className="text-xs uppercase font-semibold leading-tight tracking-wider">
              {data.foundationName}
            </h4>
          )}
          {data.deptName && (
            <div className="text-[10px] md:text-[11px] uppercase font-medium leading-tight whitespace-pre-line tracking-wide">
              {data.deptName}
            </div>
          )}
          <h3 className="text-base md:text-lg uppercase font-bold leading-snug tracking-wide mt-0.5">
            {data.schoolName}
          </h3>
          <p className="text-[9px] md:text-[10px] leading-tight font-sans mt-1">
            {data.address} {data.postalCode && `Kodepos ${data.postalCode}`}
          </p>
          {data.email && (
            <p className="text-[8.5px] md:text-[9.5px] leading-tight font-sans">
              Email: {data.email}
            </p>
          )}
        </div>
      </div>

      {/* Double Border Line */}
      <div className="kop-line"></div>
    </div>
  );
};
