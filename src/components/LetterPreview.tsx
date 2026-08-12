import React from 'react';
import { type SchoolSettings } from '../services/db';
import { SchoolHeader } from './SchoolHeader';
import { SignatureArea } from './SignatureArea';
import { formatIndonesianDate } from '../templates';

interface LetterPreviewProps {
  type: 'skl' | 'undangan' | 'tugas' | 'pengantar' | 'rekomendasi' | 'pindahan';
  formData: Record<string, any>;
  settings: SchoolSettings;
  paperSize?: 'a4' | 'f4';
  fontFamily?: 'serif' | 'sans';
}

export const LetterPreview: React.FC<LetterPreviewProps> = ({
  type,
  formData,
  settings,
  paperSize = 'a4',
  fontFamily = 'serif',
}) => {
  const paperClass = paperSize === 'f4' ? 'paper-f4' : 'paper-a4';
  const fontClass = fontFamily === 'sans' ? 'letter-font-sans' : 'letter-font-serif';

  // Fallbacks for data fields
  const refNumber = formData.refNumber || '___/___/___/____';
  const letterDate = formData.letterDate || new Date().toISOString().split('T')[0];

  const renderLetterBody = () => {
    switch (type) {
      case 'skl': {
        const studentName = formData.studentName || '...........................................';
        const nis = formData.nis || '............................';
        const nisn = formData.nisn || '............................';
        const birthPlace = formData.birthPlace || '............................';
        const birthDate = formData.birthDate ? formatIndonesianDate(formData.birthDate) : '............................';
        const parentName = formData.parentName || '...........................................';
        const program = formData.program || '...........................................';
        const status = formData.status || 'LULUS';
        const notes = formData.additionalNotes || '';
        
        return (
          <>
            {/* Title */}
            <div className="text-center my-6">
              <h2 className="text-base font-bold uppercase tracking-wider underline">SURAT KETERANGAN LULUS</h2>
              <p className="text-sm">Nomor: {refNumber}</p>
            </div>

            <p className="mb-4">
              Yang bertanda tangan di bawah ini, Kepala {settings.schoolName}, Kabupaten/Kota {settings.address.match(/(?:Kota|Kabupaten)\s+([A-Za-z\s]+)/i)?.[1] || 'Bandung'}, Provinsi Jawa Barat, menerangkan bahwa:
            </p>

            <table className="w-full mb-6 text-sm">
              <tbody>
                <tr>
                  <td className="w-[32%] py-1 align-top">Nama Lengkap</td>
                  <td className="w-[3%] py-1 align-top">:</td>
                  <td className="w-[65%] py-1 align-top font-bold uppercase">{studentName}</td>
                </tr>
                <tr>
                  <td className="py-1 align-top">Tempat, Tanggal Lahir</td>
                  <td className="py-1 align-top">:</td>
                  <td className="py-1 align-top">{birthPlace}, {birthDate}</td>
                </tr>
                <tr>
                  <td className="py-1 align-top">Nama Orang Tua / Wali</td>
                  <td className="py-1 align-top">:</td>
                  <td className="py-1 align-top">{parentName}</td>
                </tr>
                <tr>
                  <td className="py-1 align-top">Nomor Induk Siswa (NIS)</td>
                  <td className="py-1 align-top">:</td>
                  <td className="py-1 align-top">{nis}</td>
                </tr>
                <tr>
                  <td className="py-1 align-top">Nomor Induk Siswa Nasional (NISN)</td>
                  <td className="py-1 align-top">:</td>
                  <td className="py-1 align-top">{nisn}</td>
                </tr>
                <tr>
                  <td className="py-1 align-top">Peminatan / Program Keahlian</td>
                  <td className="py-1 align-top">:</td>
                  <td className="py-1 align-top">{program}</td>
                </tr>
              </tbody>
            </table>

            <p className="mb-4 leading-relaxed">
              Berdasarkan kriteria kelulusan peserta didik yang ditetapkan oleh {settings.schoolName}, nilai ujian sekolah serta rapat pleno kelulusan dewan guru tahun pelajaran {formData.graduationYear || '2025/2026'}, siswa tersebut di atas dinyatakan:
            </p>

            <div className="text-center my-6">
              <div className="inline-block border-2 border-black px-12 py-2 text-lg font-bold tracking-widest uppercase">
                {status}
              </div>
            </div>

            <p className="mb-6">
              Demikian Surat Keterangan Lulus ini diberikan agar dapat dipergunakan sebagaimana mestinya. {notes && <span className="block mt-2 italic font-sans text-xs text-gray-700">Catatan: {notes}</span>}
            </p>

            <SignatureArea settings={settings} date={letterDate} showPhotoBox={status === 'LULUS'} />
          </>
        );
      }
      
      case 'undangan': {
        const targetRecipient = formData.targetRecipient || 'Orang Tua / Wali Siswa';
        const openingNotes = formData.openingNotes || '';
        const eventDayDate = formData.eventDayDate || '........................';
        const eventTime = formData.eventTime || '........................';
        const eventLocation = formData.eventLocation || '........................';
        const eventAgenda = formData.eventAgenda || '';
        const closingNotes = formData.closingNotes || '';
        
        return (
          <>
            {/* Letter Meta Details (Nomor, Sifat, Hal) */}
            <div className="flex justify-between text-sm mb-6 mt-4">
              <div className="flex flex-col">
                <div className="flex"><span className="w-20">Nomor</span><span className="mr-2">:</span><span>{refNumber}</span></div>
                <div className="flex"><span className="w-20">Lampiran</span><span className="mr-2">:</span><span>{formData.attachments || '-'}</span></div>
                <div className="flex"><span className="w-20">Hal</span><span className="mr-2">:</span><span className="font-bold">{formData.subject || 'Undangan'}</span></div>
              </div>
              <div className="text-right">
                <p>{settings.address.match(/(?:Kota|Kabupaten)\s+([A-Za-z\s]+)/i)?.[1] || 'Bandung'}, {formatIndonesianDate(letterDate)}</p>
              </div>
            </div>

            {/* Recipient Address */}
            <div className="mb-6 text-sm">
              <p>Kepada Yth.</p>
              <p className="font-bold">{targetRecipient}</p>
              <p>Di Tempat</p>
            </div>

            {/* Content */}
            <p className="mb-4 text-sm indent-8">{openingNotes}</p>

            {/* Meeting Schedule Table */}
            <table className="w-[85%] mx-auto mb-6 text-sm">
              <tbody>
                <tr>
                  <td className="w-[25%] py-1 align-top">Hari / Tanggal</td>
                  <td className="w-[3%] py-1 align-top">:</td>
                  <td className="w-[72%] py-1 align-top font-bold">{eventDayDate}</td>
                </tr>
                <tr>
                  <td className="py-1 align-top">Waktu</td>
                  <td className="py-1 align-top">:</td>
                  <td className="py-1 align-top">{eventTime}</td>
                </tr>
                <tr>
                  <td className="py-1 align-top">Tempat</td>
                  <td className="py-1 align-top">:</td>
                  <td className="py-1 align-top">{eventLocation}</td>
                </tr>
                {eventAgenda && (
                  <tr>
                    <td className="py-1 align-top">Acara / Agenda</td>
                    <td className="py-1 align-top">:</td>
                    <td className="py-1 align-top whitespace-pre-line">{eventAgenda}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <p className="mb-8 text-sm indent-8">{closingNotes}</p>

            <SignatureArea settings={settings} date={letterDate} />
          </>
        );
      }
      
      case 'tugas': {
        const foundation = formData.foundation || '...........................................';
        const staffName = formData.staffName || '...........................................';
        const staffNip = formData.staffNip || '............................';
        const staffRank = formData.staffRank || '............................';
        const staffRole = formData.staffRole || '............................';
        const taskPurpose = formData.taskPurpose || '...........................................';
        const taskDate = formData.taskDate || '............................';
        const taskLocation = formData.taskLocation || '...........................................';
        const closingNotes = formData.closingNotes || '';
        
        return (
          <>
            {/* Title */}
            <div className="text-center my-6">
              <h2 className="text-base font-bold uppercase tracking-wider underline">SURAT TUGAS</h2>
              <p className="text-sm">Nomor: {refNumber}</p>
            </div>

            {/* Legal Basis / Foundation */}
            <div className="text-sm mb-6 flex">
              <span className="w-16 flex-shrink-0">Dasar</span>
              <span className="mr-2">:</span>
              <span className="flex-grow whitespace-pre-line">{foundation}</span>
            </div>

            <div className="text-center font-bold text-sm uppercase my-4">MEMERINTAHKAN:</div>

            {/* Recipient Details */}
            <div className="text-sm mb-4 flex">
              <span className="w-16 flex-shrink-0">Kepada</span>
              <span className="mr-2">:</span>
              <div className="flex-grow">
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="w-[30%] py-0.5 align-top">Nama Lengkap</td>
                      <td className="w-[3%] py-0.5 align-top">:</td>
                      <td className="w-[67%] py-0.5 align-top font-bold">{staffName}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 align-top">NIP / NUPTK</td>
                      <td className="py-0.5 align-top">:</td>
                      <td className="py-0.5 align-top">{staffNip}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 align-top">Pangkat / Golongan</td>
                      <td className="py-0.5 align-top">:</td>
                      <td className="py-0.5 align-top">{staffRank}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 align-top">Jabatan</td>
                      <td className="py-0.5 align-top">:</td>
                      <td className="py-0.5 align-top">{staffRole}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Task Purpose */}
            <div className="text-sm mb-6 flex">
              <span className="w-16 flex-shrink-0">Untuk</span>
              <span className="mr-2">:</span>
              <div className="flex-grow">
                <ol className="list-decimal pl-4 space-y-1.5">
                  <li>{taskPurpose}</li>
                  <li>Pelaksanaan tugas diselenggarakan pada:
                    <table className="w-full mt-1">
                      <tbody>
                        <tr>
                          <td className="w-[20%] py-0.5 align-top text-gray-700">Waktu</td>
                          <td className="w-[3%] py-0.5 align-top">:</td>
                          <td className="w-[77%] py-0.5 align-top font-bold">{taskDate}</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 align-top text-gray-700">Tempat</td>
                          <td className="py-0.5 align-top">:</td>
                          <td className="py-0.5 align-top">{taskLocation}</td>
                        </tr>
                      </tbody>
                    </table>
                  </li>
                  <li>Melaporkan hasil pelaksanaan tugas kepada Kepala Sekolah setelah selesai melaksanakan penugasan.</li>
                </ol>
              </div>
            </div>

            <p className="mb-8 text-sm">{closingNotes}</p>

            <SignatureArea settings={settings} date={letterDate} />
          </>
        );
      }
      
      case 'pengantar': {
        const recipientName = formData.recipientName || '...........................................';
        const recipientAddr = formData.recipientAddr || '............................';
        const introduction = formData.introduction || '';
        const closingNotes = formData.closingNotes || '';
        const tableData = formData.tableData || [];
        
        return (
          <>
            {/* Letter Meta Details (Nomor, Sifat, Hal) */}
            <div className="flex justify-between text-sm mb-6 mt-4">
              <div className="flex flex-col">
                <div className="flex"><span className="w-20">Nomor</span><span className="mr-2">:</span><span>{refNumber}</span></div>
                <div className="flex"><span className="w-20">Lampiran</span><span className="mr-2">:</span><span>-</span></div>
                <div className="flex"><span className="w-20">Perihal</span><span className="mr-2">:</span><span className="font-bold underline">Surat Pengantar Dokumen</span></div>
              </div>
              <div className="text-right">
                <p>{settings.address.match(/(?:Kota|Kabupaten)\s+([A-Za-z\s]+)/i)?.[1] || 'Bandung'}, {formatIndonesianDate(letterDate)}</p>
              </div>
            </div>

            {/* Recipient Address */}
            <div className="mb-6 text-sm">
              <p>Kepada Yth.</p>
              <p className="font-bold">{recipientName}</p>
              <p className="whitespace-pre-line">{recipientAddr}</p>
              <p>Di Tempat</p>
            </div>

            {/* Intro */}
            <p className="mb-4 text-sm indent-8">{introduction}</p>

            {/* Document Table */}
            <table className="w-full border-collapse border border-black mb-6 text-sm">
              <thead>
                <tr className="bg-gray-100 print:bg-transparent">
                  <th className="border border-black px-2 py-1.5 text-center w-[8%]">No</th>
                  <th className="border border-black px-3 py-1.5 text-left">Jenis Berkas / Dokumen</th>
                  <th className="border border-black px-2 py-1.5 text-center w-[18%]">Jumlah</th>
                  <th className="border border-black px-3 py-1.5 text-left w-[30%]">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length > 0 ? (
                  tableData.map((row: any, idx: number) => (
                    <tr key={idx}>
                      <td className="border border-black px-2 py-1.5 text-center align-top">{row.c0 || (idx + 1)}</td>
                      <td className="border border-black px-3 py-1.5 align-top">{row.c1 || '................................'}</td>
                      <td className="border border-black px-2 py-1.5 text-center align-top">{row.c2 || '................'}</td>
                      <td className="border border-black px-3 py-1.5 align-top">{row.c3 || '................'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="border border-black px-2 py-3 text-center" colSpan={4}>Belum ada berkas terdaftar</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Outro */}
            <p className="mb-8 text-sm indent-8">{closingNotes}</p>

            <SignatureArea settings={settings} date={letterDate} />
          </>
        );
      }
      
      case 'rekomendasi': {
        const name = formData.recommendedName || '...........................................';
        const identity = formData.recommendedIdentity || '............................';
        const position = formData.recommendedPosition || '............................';
        const address = formData.recommendedAddress || '............................';
        const purpose = formData.recommendationPurpose || '...........................................';
        const content = formData.recommendationContent || '';
        const closingNotes = formData.closingNotes || '';
        
        return (
          <>
            {/* Title */}
            <div className="text-center my-6">
              <h2 className="text-base font-bold uppercase tracking-wider underline">SURAT REKOMENDASI</h2>
              <p className="text-sm">Nomor: {refNumber}</p>
            </div>

            <p className="mb-4">
              Yang bertanda tangan di bawah ini, Kepala {settings.schoolName}, dengan ini menerangkan dan memberikan rekomendasi kepada:
            </p>

            <table className="w-full mb-6 text-sm">
              <tbody>
                <tr>
                  <td className="w-[30%] py-1 align-top">Nama Lengkap</td>
                  <td className="w-[3%] py-1 align-top">:</td>
                  <td className="w-[67%] py-1 align-top font-bold uppercase">{name}</td>
                </tr>
                <tr>
                  <td className="py-1 align-top">NISN / NIP</td>
                  <td className="py-1 align-top">:</td>
                  <td className="py-1 align-top">{identity}</td>
                </tr>
                <tr>
                  <td className="py-1 align-top">Jabatan / Kelas</td>
                  <td className="py-1 align-top">:</td>
                  <td className="py-1 align-top">{position}</td>
                </tr>
                <tr>
                  <td className="py-1 align-top">Alamat Rumah</td>
                  <td className="py-1 align-top">:</td>
                  <td className="py-1 align-top whitespace-pre-line">{address}</td>
                </tr>
              </tbody>
            </table>

            <p className="mb-4 text-sm">
              Untuk mendaftar / mengikuti keikutsertaan dalam kegiatan: <strong className="underline">{purpose}</strong>.
            </p>

            <p className="mb-6 text-sm indent-8 leading-relaxed">
              {content}
            </p>

            <p className="mb-8 text-sm">{closingNotes}</p>

            <SignatureArea settings={settings} date={letterDate} />
          </>
        );
      }
      
      case 'pindahan': {
        const studentName = formData.studentName || '...........................................';
        const nisn = formData.nisn || '............................';
        const originSchool = formData.originSchool || '...........................................';
        const originClass = formData.originClass || '............................';
        const acceptedClass = formData.acceptedClass || '............................';
        const acceptedDate = formData.acceptedDate ? formatIndonesianDate(formData.acceptedDate) : '............................';
        const requestDetails = formData.requestDetails || '';
        const closingNotes = formData.closingNotes || '';
        
        return (
          <>
            {/* Title */}
            <div className="text-center my-6">
              <h2 className="text-base font-bold uppercase tracking-wider underline">SURAT KETERANGAN MENERIMA PINDAHAN</h2>
              <p className="text-sm">Nomor: {refNumber}</p>
            </div>

            <p className="mb-4 text-sm text-justify indent-8">
              {requestDetails} Dengan ini Kepala {settings.schoolName} menyatakan bersedia menerima mutasi masuk siswa tersebut di bawah ini:
            </p>

            <table className="w-full mb-6 text-sm">
              <tbody>
                <tr>
                  <td className="w-[30%] py-1 align-top">Nama Lengkap Siswa</td>
                  <td className="w-[3%] py-1 align-top">:</td>
                  <td className="w-[67%] py-1 align-top font-bold uppercase">{studentName}</td>
                </tr>
                <tr>
                  <td className="py-1 align-top">Nomor NISN</td>
                  <td className="py-1 align-top">:</td>
                  <td className="py-1 align-top">{nisn}</td>
                </tr>
                <tr>
                  <td className="py-1 align-top">Sekolah Asal</td>
                  <td className="py-1 align-top">:</td>
                  <td className="py-1 align-top">{originSchool}</td>
                </tr>
                <tr>
                  <td className="py-1 align-top">Tingkat / Kelas Asal</td>
                  <td className="py-1 align-top">:</td>
                  <td className="py-1 align-top">{originClass}</td>
                </tr>
              </tbody>
            </table>

            <p className="mb-4 text-sm leading-relaxed">
              Yang bersangkutan akan ditempatkan pada tingkatan <strong>Kelas {acceptedClass}</strong> dan dapat mulai mengikuti kegiatan belajar di sekolah kami terhitung sejak tanggal <strong>{acceptedDate}</strong>.
            </p>

            <p className="mb-8 text-sm text-justify">{closingNotes}</p>

            <SignatureArea settings={settings} date={letterDate} />
          </>
        );
      }
      
      default:
        return <div>Jenis surat tidak didukung</div>;
    }
  };

  return (
    <div className="print-area">
      <div className={`${paperClass} ${fontClass} text-justify leading-relaxed`}>
        {/* Kop Surat (Letterhead) */}
        <SchoolHeader settings={settings} />
        
        {/* Main Content Area */}
        <div className="mt-4 flex-grow">
          {renderLetterBody()}
        </div>
      </div>
    </div>
  );
};
