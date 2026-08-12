import React from 'react';
import { type SchoolSettings } from '../services/db';
import { formatIndonesianDate } from '../templates';

interface SignatureAreaProps {
  settings: SchoolSettings;
  date: string;
  city?: string;
  customRole?: string; // If signature is by someone else
  showPhotoBox?: boolean; // For SKL student photo
}

export const SignatureArea: React.FC<SignatureAreaProps> = ({
  settings,
  date,
  city = 'Bandung',
  customRole = 'Kepala Sekolah',
  showPhotoBox = false,
}) => {
  const formattedDate = formatIndonesianDate(date);
  
  // Try to parse city from settings address if not provided
  let displayCity = city;
  if (!city && settings.address) {
    const match = settings.address.match(/(?:Kota|Kabupaten|Kec\.)\s+([A-Za-z\s]+)/i);
    if (match && match[1]) {
      displayCity = match[1].trim();
    }
  }

  return (
    <div className="flex justify-between items-start mt-8 w-full letter-font-serif text-black text-sm text-justify leading-relaxed no-select">
      {/* Student Photo Box (Left side) if required (usually SKL) */}
      <div className="w-1/2 flex justify-start items-end">
        {showPhotoBox && (
          <div className="w-[3cm] h-[4cm] border border-gray-400 flex flex-col items-center justify-center bg-gray-50 text-[10px] text-gray-500 font-sans p-2 text-center rounded print:bg-white print:border-black">
            <span className="font-bold">PAS FOTO</span>
            <span>3 x 4 cm</span>
          </div>
        )}
      </div>

      {/* Signature Box (Right side) */}
      <div className="w-1/2 flex flex-col items-start pl-12 text-left">
        <p className="mb-0">
          {displayCity}, {formattedDate}
        </p>
        <p className="font-bold mb-0">
          {customRole},
        </p>
        
        <div className="h-[2.5cm] w-full my-2 flex items-center justify-start relative">
          {settings.signatureUrl ? (
            <img 
              src={settings.signatureUrl} 
              alt="Tanda Tangan & Cap" 
              className="max-h-full max-w-[80%] object-contain mix-blend-multiply" 
            />
          ) : (
            <div className="border border-dashed border-gray-300 rounded text-[10px] text-gray-400 p-2 text-center w-[80%] print:border-transparent print:text-transparent">
              Cap & Tanda Tangan
            </div>
          )}
        </div>

        <p className="font-bold underline mb-0">
          {settings.principalName}
        </p>
        {settings.principalNip && (
          <p className="text-xs mb-0">
            NIP. {settings.principalNip}
          </p>
        )}
      </div>
    </div>
  );
};
