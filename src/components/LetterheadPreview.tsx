import React, { useState, useEffect, useRef } from 'react';
import { School, Camera } from 'lucide-react';
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
  isEditable?: boolean;
  onKopChange?: (field: keyof SchoolProfile, val: string) => void;
  onLogoChange?: (side: 'kiri' | 'kanan', base64: string) => void;
}

export const LetterheadPreview: React.FC<LetterheadPreviewProps> = ({ 
  profile, 
  isEditable = true,
  onKopChange,
  onLogoChange
}) => {
  const data: SchoolProfile = {
    ...DEFAULT_SCHOOL_PROFILE,
    ...profile,
    logoUrl: profile?.logoUrl !== undefined && profile?.logoUrl !== '' ? profile.logoUrl : LOGO_KIRI_DEFAULT,
    logoKananUrl: profile?.logoKananUrl !== undefined && profile?.logoKananUrl !== '' ? profile.logoKananUrl : LOGO_KANAN_DEFAULT,
  };

  const [processedLogoKiri, setProcessedLogoKiri] = useState<string>(data.logoUrl || LOGO_KIRI_DEFAULT);
  const [processedLogoKanan, setProcessedLogoKanan] = useState<string>(data.logoKananUrl || LOGO_KANAN_DEFAULT);

  const fileInputKiriRef = useRef<HTMLInputElement>(null);
  const fileInputKananRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data.logoUrl) {
      removeBlackBackground(data.logoUrl).then(cleanedUrl => {
        setProcessedLogoKiri(cleanedUrl || data.logoUrl || LOGO_KIRI_DEFAULT);
      }).catch(() => {
        setProcessedLogoKiri(data.logoUrl || LOGO_KIRI_DEFAULT);
      });
    } else {
      setProcessedLogoKiri(LOGO_KIRI_DEFAULT);
    }
  }, [data.logoUrl]);

  useEffect(() => {
    if (data.logoKananUrl) {
      removeBlackBackground(data.logoKananUrl).then(cleanedUrl => {
        setProcessedLogoKanan(cleanedUrl || data.logoKananUrl || LOGO_KANAN_DEFAULT);
      }).catch(() => {
        setProcessedLogoKanan(data.logoKananUrl || LOGO_KANAN_DEFAULT);
      });
    } else {
      setProcessedLogoKanan(LOGO_KANAN_DEFAULT);
    }
  }, [data.logoKananUrl]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'kiri' | 'kanan') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (onLogoChange) {
          onLogoChange(side, base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full bg-white select-text relative">
      <div className="flex items-center justify-between gap-3 text-black font-serif">
        {/* Left Logo (Hijau - Pemda / Provinsi Maluku Utara) */}
        <div 
          onClick={() => isEditable && fileInputKiriRef.current?.click()}
          title={isEditable ? "Klik untuk mengganti Logo Kiri" : undefined}
          className={`w-[72px] h-[72px] min-w-[72px] max-w-[72px] max-h-[72px] flex-shrink-0 flex items-center justify-center bg-white overflow-hidden relative group ${
            isEditable ? 'cursor-pointer hover:ring-2 hover:ring-blue-400 rounded-lg' : ''
          }`}
        >
          {processedLogoKiri || data.logoUrl ? (
            <img 
              src={processedLogoKiri || data.logoUrl} 
              alt="Logo Pemda (Kiri)" 
              className="w-full h-full max-w-[72px] max-h-[72px] object-contain block"
              loading="eager"
            />
          ) : (
            <div className="flex flex-col items-center text-slate-400 print:text-black">
              <School className="w-7 h-7 stroke-[1.5]" />
              <span className="text-[7px] font-sans no-print">Logo Kiri</span>
            </div>
          )}

          {isEditable && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity no-print rounded-lg">
              <Camera className="w-4 h-4" />
            </div>
          )}
          <input 
            ref={fileInputKiriRef}
            type="file" 
            accept="image/*" 
            onChange={(e) => handleFileUpload(e, 'kiri')} 
            className="hidden" 
          />
        </div>

        {/* Center Text Section (Directly Editable on Paper) */}
        <div className="flex-1 text-center px-1 font-serif">
          {data.foundationName && (
            <h4 
              contentEditable={isEditable}
              suppressContentEditableWarning={true}
              onBlur={(e) => onKopChange && onKopChange('foundationName', e.currentTarget.innerText.trim())}
              className="text-[12px] uppercase font-bold leading-snug tracking-normal text-black outline-none focus:bg-blue-50/60 rounded px-1 transition-colors"
            >
              {data.foundationName}
            </h4>
          )}
          
          <div 
            contentEditable={isEditable}
            suppressContentEditableWarning={true}
            onBlur={(e) => onKopChange && onKopChange('deptName', e.currentTarget.innerText.trim())}
            className="text-[12px] md:text-[13px] uppercase font-bold leading-tight whitespace-pre-line tracking-normal text-black outline-none focus:bg-blue-50/60 rounded px-1 transition-colors"
          >
            {data.deptName}
          </div>

          <h3 
            contentEditable={isEditable}
            suppressContentEditableWarning={true}
            onBlur={(e) => onKopChange && onKopChange('schoolName', e.currentTarget.innerText.trim())}
            className="text-[14px] md:text-[15px] uppercase font-bold leading-tight tracking-normal mt-0.5 text-black outline-none focus:bg-blue-50/60 rounded px-1 transition-colors"
          >
            {data.schoolName || 'SMK NEGERI 2 KOTA TIDORE KEPULAUAN'}
          </h3>

          <p 
            contentEditable={isEditable}
            suppressContentEditableWarning={true}
            onBlur={(e) => onKopChange && onKopChange('address', e.currentTarget.innerText.trim())}
            className="text-[10.5px] leading-tight mt-0.5 font-normal text-black font-serif outline-none focus:bg-blue-50/60 rounded px-1 transition-colors"
          >
            <span>{data.address || 'Jln.Raya Soasio-Rum Kel.Tomalou Kec.Tidore Selatan'}</span>
            {data.email && (
              <span className="ml-2 font-serif">
                <em>E-Maile:</em>{data.email}
              </span>
            )}
            {data.phone && (
              <span className="ml-2 font-serif">
                <em>Telp:</em>{data.phone}
              </span>
            )}
          </p>
        </div>

        {/* Right Logo (Biru - SMKN 2 Tidore Kepulauan) */}
        <div 
          onClick={() => isEditable && fileInputKananRef.current?.click()}
          title={isEditable ? "Klik untuk mengganti Logo Kanan" : undefined}
          className={`w-[72px] h-[72px] min-w-[72px] max-w-[72px] max-h-[72px] flex-shrink-0 flex items-center justify-center bg-white overflow-hidden relative group ${
            isEditable ? 'cursor-pointer hover:ring-2 hover:ring-blue-400 rounded-lg' : ''
          }`}
        >
          {processedLogoKanan || data.logoKananUrl ? (
            <img 
              src={processedLogoKanan || data.logoKananUrl} 
              alt="Logo SMKN 2 Tikep (Kanan)" 
              className="w-full h-full max-w-[72px] max-h-[72px] object-contain block"
              loading="eager"
            />
          ) : (
            <div className="flex flex-col items-center text-slate-400 print:text-black">
              <School className="w-7 h-7 stroke-[1.5]" />
              <span className="text-[7px] font-sans no-print">Logo Kanan</span>
            </div>
          )}

          {isEditable && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity no-print rounded-lg">
              <Camera className="w-4 h-4" />
            </div>
          )}
          <input 
            ref={fileInputKananRef}
            type="file" 
            accept="image/*" 
            onChange={(e) => handleFileUpload(e, 'kanan')} 
            className="hidden" 
          />
        </div>
      </div>

      {/* Double Border Line Formal Kop Surat Sesuai Format Resmi */}
      <div className="kop-line"></div>
    </div>
  );
};
