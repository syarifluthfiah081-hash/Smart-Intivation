import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  AlignmentType, 
  UnderlineType, 
  WidthType,
  BorderStyle
} from 'docx';
import { type SchoolSettings } from './db';
import { formatIndonesianDate } from '../templates';

// Create a double line replacement in docx (using a bottom border on cell or a paragraph border)
const createKopBorder = () => {
  return new Paragraph({
    spacing: { after: 300 },
    border: {
      bottom: {
        color: "000000",
        space: 5,
        style: BorderStyle.DOUBLE,
        size: 24,
      }
    }
  });
};

export async function exportToDocx(
  type: string,
  formData: Record<string, any>,
  settings: SchoolSettings
) {
  const children: any[] = [];

  // 1. GENERATE KOP SURAT (LETTERHEAD)
  const lines = settings.governingBody.split('\n');
  lines.forEach((line) => {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: line.toUpperCase(),
            bold: true,
            size: 22, // 11pt
            font: "Times New Roman"
          })
        ]
      })
    );
  });

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: settings.schoolName.toUpperCase(),
          bold: true,
          size: 28, // 14pt
          font: "Times New Roman"
        })
      ]
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: `${settings.address} Kode Pos ${settings.postCode}`,
          italics: true,
          size: 18, // 9pt
          font: "Times New Roman"
        }),
        new TextRun({
          text: `\nTelp: ${settings.phone} | Email: ${settings.email} | Website: ${settings.website}`,
          italics: true,
          size: 18,
          font: "Times New Roman"
        })
      ]
    })
  );

  // Add the Kop Surat double border line
  children.push(createKopBorder());

  const refNumber = formData.refNumber || '___/___/___/____';
  const letterDate = formData.letterDate || new Date().toISOString().split('T')[0];

  // 2. LETTER CONTENT GENERATION
  switch (type) {
    case 'skl': {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "SURAT KETERANGAN LULUS", bold: true, underline: { type: UnderlineType.SINGLE }, size: 24, font: "Times New Roman" })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [
            new TextRun({ text: `Nomor: ${refNumber}`, size: 22, font: "Times New Roman" })
          ]
        }),
        new Paragraph({
          spacing: { after: 240 },
          children: [
            new TextRun({
              text: `Yang bertanda tangan di bawah ini, Kepala ${settings.schoolName}, Kabupaten/Kota Bandung, Provinsi Jawa Barat, dengan ini menerangkan bahwa:`,
              size: 22,
              font: "Times New Roman"
            })
          ]
        })
      );

      // Student Table details
      const tableRows = [
        ['Nama Lengkap', formData.studentName || ''],
        ['Tempat, Tanggal Lahir', `${formData.birthPlace || ''}, ${formData.birthDate ? formatIndonesianDate(formData.birthDate) : ''}`],
        ['Nama Orang Tua / Wali', formData.parentName || ''],
        ['Nomor Induk Siswa (NIS)', formData.nis || ''],
        ['Nomor Induk Siswa Nasional (NISN)', formData.nisn || ''],
        ['Peminatan / Program Keahlian', formData.program || ''],
      ].map(([label, val]) => (
        new TableRow({
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [new Paragraph({ children: [new TextRun({ text: label, size: 22, font: "Times New Roman" })] })]
            }),
            new TableCell({
              width: { size: 5, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [new Paragraph({ children: [new TextRun({ text: ":", size: 22, font: "Times New Roman" })] })]
            }),
            new TableCell({
              width: { size: 60, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [new Paragraph({ children: [new TextRun({ text: val.toUpperCase(), bold: label === 'Nama Lengkap', size: 22, font: "Times New Roman" })] })]
            }),
          ]
        })
      ));

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableRows,
        }),
        new Paragraph({ spacing: { before: 240, after: 240 } }),
        new Paragraph({
          spacing: { after: 400 },
          children: [
            new TextRun({
              text: `Berdasarkan kriteria kelulusan peserta didik yang ditetapkan oleh ${settings.schoolName}, nilai ujian sekolah serta rapat pleno kelulusan dewan guru tahun pelajaran ${formData.graduationYear || '2025/2026'}, siswa tersebut di atas dinyatakan:`,
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [
            new TextRun({
              text: `  ${formData.status || 'LULUS'}  `,
              bold: true,
              size: 32,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 600 },
          children: [
            new TextRun({
              text: `Demikian Surat Keterangan Lulus ini diberikan agar dapat dipergunakan sebagaimana mestinya.`,
              size: 22,
              font: "Times New Roman"
            })
          ]
        })
      );
      break;
    }

    case 'undangan': {
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: {
                    top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                  },
                  children: [
                    new Paragraph({ children: [new TextRun({ text: `Nomor  : ${refNumber}`, size: 22, font: "Times New Roman" })] }),
                    new Paragraph({ children: [new TextRun({ text: `Lamp.   : ${formData.attachments || '-'}`, size: 22, font: "Times New Roman" })] }),
                    new Paragraph({ children: [new TextRun({ text: `Hal       : ${formData.subject || 'Undangan'}`, bold: true, size: 22, font: "Times New Roman" })] }),
                  ]
                }),
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: {
                    top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      children: [new TextRun({ text: `${settings.address.match(/(?:Kota|Kabupaten)\s+([A-Za-z\s]+)/i)?.[1] || 'Bandung'}, ${formatIndonesianDate(letterDate)}`, size: 22, font: "Times New Roman" })]
                    })
                  ]
                })
              ]
            })
          ]
        }),
        new Paragraph({ spacing: { before: 240, after: 200 } }),
        new Paragraph({
          children: [
            new TextRun({ text: "Kepada Yth.\n", size: 22, font: "Times New Roman" }),
            new TextRun({ text: formData.targetRecipient || 'Orang Tua / Wali Siswa', bold: true, size: 22, font: "Times New Roman" }),
            new TextRun({ text: "\nDi Tempat", size: 22, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({ spacing: { before: 120, after: 200 } }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: formData.openingNotes || '',
              size: 22,
              font: "Times New Roman"
            })
          ]
        })
      );

      const agendaRows = [
        ['Hari / Tanggal', formData.eventDayDate || ''],
        ['Waktu', formData.eventTime || ''],
        ['Tempat', formData.eventLocation || ''],
        ['Acara', formData.eventAgenda || '']
      ].map(([label, val]) => (
        new TableRow({
          children: [
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              },
              children: [new Paragraph({ children: [new TextRun({ text: label, size: 22, font: "Times New Roman" })] })]
            }),
            new TableCell({
              width: { size: 5, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              },
              children: [new Paragraph({ children: [new TextRun({ text: ":", size: 22, font: "Times New Roman" })] })]
            }),
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              },
              children: [new Paragraph({ children: [new TextRun({ text: val, bold: label === 'Hari / Tanggal', size: 22, font: "Times New Roman" })] })]
            })
          ]
        })
      ));

      children.push(
        new Table({
          width: { size: 90, type: WidthType.PERCENTAGE },
          rows: agendaRows
        }),
        new Paragraph({ spacing: { before: 200, after: 200 } }),
        new Paragraph({
          spacing: { after: 600 },
          children: [
            new TextRun({
              text: formData.closingNotes || '',
              size: 22,
              font: "Times New Roman"
            })
          ]
        })
      );
      break;
    }
    
    case 'tugas': {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "SURAT TUGAS", bold: true, underline: { type: UnderlineType.SINGLE }, size: 24, font: "Times New Roman" })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          children: [
            new TextRun({ text: `Nomor: ${refNumber}`, size: 22, font: "Times New Roman" })
          ]
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({ text: "Dasar: ", bold: true, size: 22, font: "Times New Roman" }),
            new TextRun({ text: formData.foundation || '', size: 22, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 200 },
          children: [new TextRun({ text: "MEMERINTAHKAN:", bold: true, size: 22, font: "Times New Roman" })]
        })
      );

      const staffRows = [
        ['Nama Lengkap', formData.staffName || ''],
        ['NIP / NUPTK', formData.staffNip || ''],
        ['Pangkat / Golongan', formData.staffRank || ''],
        ['Jabatan', formData.staffRole || ''],
      ].map(([label, val]) => (
        new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              },
              children: [new Paragraph({ children: [new TextRun({ text: label, size: 22, font: "Times New Roman" })] })]
            }),
            new TableCell({
              width: { size: 5, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              },
              children: [new Paragraph({ children: [new TextRun({ text: ":", size: 22, font: "Times New Roman" })] })]
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              },
              children: [new Paragraph({ children: [new TextRun({ text: val, bold: label === 'Nama Lengkap', size: 22, font: "Times New Roman" })] })]
            })
          ]
        })
      ));

      children.push(
        new Paragraph({ children: [new TextRun({ text: "Kepada:", bold: true, size: 22, font: "Times New Roman" })], spacing: { after: 100 } }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: staffRows
        }),
        new Paragraph({ spacing: { before: 200, after: 100 } }),
        new Paragraph({
          children: [new TextRun({ text: "Untuk:", bold: true, size: 22, font: "Times New Roman" })],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `1. ${formData.taskPurpose || ''}\n`, size: 22, font: "Times New Roman" }),
            new TextRun({ text: `2. Pelaksanaan tugas diselenggarakan pada:\n`, size: 22, font: "Times New Roman" }),
            new TextRun({ text: `   - Waktu   : ${formData.taskDate || ''}\n`, bold: true, size: 22, font: "Times New Roman" }),
            new TextRun({ text: `   - Tempat  : ${formData.taskLocation || ''}\n`, size: 22, font: "Times New Roman" }),
            new TextRun({ text: `3. Melaporkan hasil pelaksanaan tugas kepada Kepala Sekolah setelah penugasan selesai.`, size: 22, font: "Times New Roman" })
          ]
        }),
        new Paragraph({ spacing: { before: 200, after: 200 } }),
        new Paragraph({
          spacing: { after: 600 },
          children: [new TextRun({ text: formData.closingNotes || '', size: 22, font: "Times New Roman" })]
        })
      );
      break;
    }

    case 'pengantar': {
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: {
                    top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                  },
                  children: [
                    new Paragraph({ children: [new TextRun({ text: `Nomor  : ${refNumber}`, size: 22, font: "Times New Roman" })] }),
                    new Paragraph({ children: [new TextRun({ text: `Lamp.   : -`, size: 22, font: "Times New Roman" })] }),
                    new Paragraph({ children: [new TextRun({ text: `Perihal : Surat Pengantar Dokumen`, bold: true, size: 22, font: "Times New Roman" })] }),
                  ]
                }),
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: {
                    top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      children: [new TextRun({ text: `${settings.address.match(/(?:Kota|Kabupaten)\s+([A-Za-z\s]+)/i)?.[1] || 'Bandung'}, ${formatIndonesianDate(letterDate)}`, size: 22, font: "Times New Roman" })]
                    })
                  ]
                })
              ]
            })
          ]
        }),
        new Paragraph({ spacing: { before: 200, after: 200 } }),
        new Paragraph({
          children: [
            new TextRun({ text: "Kepada Yth.\n", size: 22, font: "Times New Roman" }),
            new TextRun({ text: formData.recipientName || '', bold: true, size: 22, font: "Times New Roman" }),
            new TextRun({ text: `\n${formData.recipientAddr || ''}`, size: 22, font: "Times New Roman" }),
            new TextRun({ text: "\nDi Tempat", size: 22, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({ spacing: { before: 120, after: 200 } }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: formData.introduction || '', size: 22, font: "Times New Roman" })]
        })
      );

      // Document list table
      const headerRow = new TableRow({
        children: [
          new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "No", bold: true, size: 20, font: "Times New Roman" })] })] }),
          new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Jenis Berkas / Dokumen", bold: true, size: 20, font: "Times New Roman" })] })] }),
          new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Jumlah", bold: true, size: 20, font: "Times New Roman" })] })] }),
          new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Keterangan", bold: true, size: 20, font: "Times New Roman" })] })] })
        ]
      });

      const dataRows = (formData.tableData || []).map((row: any, idx: number) => (
        new TableRow({
          children: [
            new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(row.c0 || (idx + 1)), size: 20, font: "Times New Roman" })] })] }),
            new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: String(row.c1 || ''), size: 20, font: "Times New Roman" })] })] }),
            new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(row.c2 || ''), size: 20, font: "Times New Roman" })] })] }),
            new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: String(row.c3 || ''), size: 20, font: "Times New Roman" })] })] })
          ]
        })
      ));

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [headerRow, ...dataRows]
        }),
        new Paragraph({ spacing: { before: 200, after: 200 } }),
        new Paragraph({
          spacing: { after: 600 },
          children: [new TextRun({ text: formData.closingNotes || '', size: 22, font: "Times New Roman" })]
        })
      );
      break;
    }
    
    case 'rekomendasi': {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "SURAT REKOMENDASI", bold: true, underline: { type: UnderlineType.SINGLE }, size: 24, font: "Times New Roman" })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          children: [
            new TextRun({ text: `Nomor: ${refNumber}`, size: 22, font: "Times New Roman" })
          ]
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({ text: `Yang bertanda tangan di bawah ini, Kepala ${settings.schoolName}, dengan ini menerangkan dan memberikan rekomendasi kepada:`, size: 22, font: "Times New Roman" })
          ]
        })
      );

      const recRows = [
        ['Nama Lengkap', formData.recommendedName || ''],
        ['NISN / NIP', formData.recommendedIdentity || ''],
        ['Jabatan / Kelas', formData.recommendedPosition || ''],
        ['Alamat Rumah', formData.recommendedAddress || ''],
      ].map(([label, val]) => (
        new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              },
              children: [new Paragraph({ children: [new TextRun({ text: label, size: 22, font: "Times New Roman" })] })]
            }),
            new TableCell({
              width: { size: 5, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              },
              children: [new Paragraph({ children: [new TextRun({ text: ":", size: 22, font: "Times New Roman" })] })]
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              },
              children: [new Paragraph({ children: [new TextRun({ text: val, bold: label === 'Nama Lengkap', size: 22, font: "Times New Roman" })] })]
            })
          ]
        })
      ));

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: recRows
        }),
        new Paragraph({ spacing: { before: 200, after: 200 } }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({ text: "Untuk mendaftar / mengikuti keikutsertaan dalam kegiatan: ", size: 22, font: "Times New Roman" }),
            new TextRun({ text: formData.recommendationPurpose || '', bold: true, underline: { type: UnderlineType.SINGLE }, size: 22, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: formData.recommendationContent || '', size: 22, font: "Times New Roman" })]
        }),
        new Paragraph({
          spacing: { after: 600 },
          children: [new TextRun({ text: formData.closingNotes || '', size: 22, font: "Times New Roman" })]
        })
      );
      break;
    }
    
    case 'pindahan': {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "SURAT KETERANGAN MENERIMA PINDAHAN", bold: true, underline: { type: UnderlineType.SINGLE }, size: 24, font: "Times New Roman" })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          children: [
            new TextRun({ text: `Nomor: ${refNumber}`, size: 22, font: "Times New Roman" })
          ]
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: formData.requestDetails || '', size: 22, font: "Times New Roman" })]
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [new TextRun({ text: `Dengan ini Kepala ${settings.schoolName} menyatakan bersedia menerima mutasi masuk siswa tersebut di bawah ini:`, size: 22, font: "Times New Roman" })]
        })
      );

      const pindahRows = [
        ['Nama Lengkap Siswa', formData.studentName || ''],
        ['Nomor NISN', formData.nisn || ''],
        ['Sekolah Asal', formData.originSchool || ''],
        ['Tingkat / Kelas Asal', formData.originClass || ''],
      ].map(([label, val]) => (
        new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              },
              children: [new Paragraph({ children: [new TextRun({ text: label, size: 22, font: "Times New Roman" })] })]
            }),
            new TableCell({
              width: { size: 5, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              },
              children: [new Paragraph({ children: [new TextRun({ text: ":", size: 22, font: "Times New Roman" })] })]
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              },
              children: [new Paragraph({ children: [new TextRun({ text: val, bold: label === 'Nama Lengkap Siswa', size: 22, font: "Times New Roman" })] })]
            })
          ]
        })
      ));

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: pindahRows
        }),
        new Paragraph({ spacing: { before: 200, after: 200 } }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({ text: "Yang bersangkutan akan ditempatkan pada tingkatan ", size: 22, font: "Times New Roman" }),
            new TextRun({ text: `Kelas ${formData.acceptedClass || ''} `, bold: true, size: 22, font: "Times New Roman" }),
            new TextRun({ text: "dan dapat mulai mengikuti kegiatan belajar di sekolah kami terhitung sejak tanggal ", size: 22, font: "Times New Roman" }),
            new TextRun({ text: `${formData.acceptedDate ? formatIndonesianDate(formData.acceptedDate) : ''}.`, bold: true, size: 22, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          spacing: { after: 600 },
          children: [new TextRun({ text: formData.closingNotes || '', size: 22, font: "Times New Roman" })]
        })
      );
      break;
    }
  }

  // 3. GENERATE SIGNATURE BLOCK (RIGHT ALIGNED)
  const displayCity = 'Bandung';
  const principalRole = 'Kepala Sekolah';
  const formattedLetterDate = formatIndonesianDate(letterDate);

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              },
              children: [
                // Optional: left side space for SKL student photo if needed, otherwise empty
                new Paragraph({ children: [new TextRun({ text: "" })] })
              ]
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              },
              children: [
                new Paragraph({ children: [new TextRun({ text: `${displayCity}, ${formattedLetterDate}`, size: 22, font: "Times New Roman" })] }),
                new Paragraph({ children: [new TextRun({ text: `${principalRole},`, bold: true, size: 22, font: "Times New Roman" })] }),
                // Add vertical space for physical signature
                new Paragraph({ spacing: { before: 800 } }),
                new Paragraph({ children: [new TextRun({ text: settings.principalName, bold: true, underline: { type: UnderlineType.SINGLE }, size: 22, font: "Times New Roman" })] }),
                new Paragraph({ children: [new TextRun({ text: `NIP. ${settings.principalNip}`, size: 20, font: "Times New Roman" })] }),
              ]
            })
          ]
        })
      ]
    })
  );

  // 4. PACK & DOWNLOAD THE DOCUMENT
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1440, // 1 inch = 1440 twips
            bottom: 1440,
            left: 1440,
            right: 1440,
          }
        }
      },
      children: children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Surat_${type}_${formData.studentName || formData.staffName || 'Sekolah'}.docx`;
  a.click();
  window.URL.revokeObjectURL(url);
}
