import React from 'react';
import { type SchoolSettings } from '../services/db';

interface SchoolHeaderProps {
  settings: SchoolSettings;
}

export const SchoolHeader: React.FC<SchoolHeaderProps> = ({ settings }) => {
  return (
    <div className="flex items-center justify-between border-b-4 border-double border-black pb-4 text-black leading-tight letter-font-serif no-select">
      {/* School Logo */}
      <div className="w-[2.2cm] h-[2.2cm] flex items-center justify-center flex-shrink-0">
        {settings.logoUrl ? (
          <img 
            src={settings.logoUrl} 
            alt="Logo Sekolah" 
            className="max-w-full max-h-full object-contain" 
          />
        ) : (
          /* Default fallback stylized icon or warning */
          <div className="w-16 h-16 border border-dashed border-gray-400 flex items-center justify-center text-[10px] text-gray-400 text-center leading-tight">
            Upload Logo<br/>di Settings
          </div>
        )}
      </div>

      {/* Header Text Info */}
      <div className="flex-grow text-center px-4">
        {settings.governingBody.split('\n').map((line, idx) => (
          <h3 key={idx} className="text-xs md:text-sm font-bold uppercase tracking-wide">
            {line}
          </h3>
        ))}
        <h1 className="text-base md:text-lg font-bold uppercase tracking-wider mt-0.5">
          {settings.schoolName}
        </h1>
        <p className="text-[10px] md:text-xs font-normal italic font-sans mt-1">
          {settings.address} {settings.postCode && `Kodepos ${settings.postCode}`}
          {(settings.phone || settings.email || settings.website) && (
            <>
              <br />
              {settings.phone && `Telp: ${settings.phone}`}
              {settings.email && ` | Email: ${settings.email}`}
              {settings.website && ` | Website: ${settings.website}`}
            </>
          )}
        </p>
      </div>

      {/* Right placeholder to keep header centered */}
      <div className="w-[2.2cm] h-[2.2cm] flex-shrink-0 flex items-center justify-center">
        {/* Can be empty to balance the left logo, or optional second logo */}
      </div>
    </div>
  );
};
