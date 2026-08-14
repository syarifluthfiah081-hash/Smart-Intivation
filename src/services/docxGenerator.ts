import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, BorderStyle, WidthType } from 'docx';
import type { SchoolProfile } from '../components/LetterheadPreview';
import { formatDateIndo } from '../templates/letterTemplates';

export const exportToDocx = async (
  profile: SchoolProfile,
  templateName: string,
  variables: Record<string, string>,
  filename: string
): Promise<void> => {
  // 1. Setup Kop Surat Dinas
  const kopRows = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            bottom: { style: BorderStyle.DOUBLE, size: 24, color: '000000' },
            top: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            ...(profile.foundationName ? [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: profile.foundationName.toUpperCase(), bold: true, size: 20, font: 'Times New Roman' }),
                ],
              })
            ] : []),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: profile.deptName?.toUpperCase() || 'DINAS PENDIDIKAN', bold: false, size: 22, font: 'Times New Roman' }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: profile.schoolName.toUpperCase(), bold: true, size: 28, font: 'Times New Roman' }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: `${profile.address}${profile.email ? ` | Email: ${profile.email}` : ''}`, size: 18, font: 'Times New Roman' }),
              ],
            }),
            new Paragraph({ text: '' }), // Spacer
          ],
        }),
      ],
    }),
  ];

  const kopTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: kopRows,
  });

  // 2. Metadata Section (Nomor, Lampiran, Tanggal)
  const dateStr = `${profile.address.split(',')[1] || 'Jakarta'}, ${formatDateIndo(variables.tanggal_surat || new Date().toISOString())}`;
  
  const metadataRows = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 60, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: `Nomor     : ${variables.nomor || '-'}`, font: 'Times New Roman', size: 22 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Lampiran  : ${variables.lampiran || '-'}`, font: 'Times New Roman', size: 22 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Perihal    : `, font: 'Times New Roman', size: 22 }),
                new TextRun({ text: variables.perihal || templateName, bold: true, font: 'Times New Roman', size: 22 }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 40, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: dateStr, font: 'Times New Roman', size: 22 }),
              ],
            }),
          ],
        }),
      ],
    }),
  ];

  const metadataTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: metadataRows,
  });

  // 3. Recipient Section
  const recipientPara = new Paragraph({
    spacing: { before: 240, after: 240 },
    children: [
      new TextRun({ text: 'Kepada Yth.\n', font: 'Times New Roman', size: 22 }),
      new TextRun({ text: `${variables.penerima || 'Bapak/Ibu Orang Tua/Wali Murid'}\n`, bold: true, font: 'Times New Roman', size: 22 }),
      new TextRun({ text: 'di Tempat', font: 'Times New Roman', size: 22 }),
    ],
  });

  // 4. Letter Content Body Paragraphs
  const bodyParagraphs: Paragraph[] = [];
  
  // Custom parsing based on template type
  if (templateName.includes('Undangan')) {
    bodyParagraphs.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: 'Dengan hormat,', font: 'Times New Roman', size: 22 })],
      }),
      new Paragraph({
        spacing: { after: 120 },
        indent: { left: 480 },
        children: [
          new TextRun({
            text: 'Sehubungan dengan dimulainya tahun ajaran baru serta penyusunan program pembelajaran dan anggaran sekolah, kami bermaksud mengundang Bapak/Ibu Orang Tua/Wali Murid untuk menghadiri Rapat Pertemuan Wali Murid yang akan diselenggarakan pada:',
            font: 'Times New Roman',
            size: 22,
          }),
        ],
      }),
      new Paragraph({
        indent: { left: 480 },
        children: [
          new TextRun({ text: `Hari, Tanggal : ${variables.hari_tanggal || '-'}\n`, font: 'Times New Roman', size: 22 }),
          new TextRun({ text: `Waktu          : ${variables.waktu || '-'}\n`, font: 'Times New Roman', size: 22 }),
          new TextRun({ text: `Tempat         : ${variables.tempat || '-'}\n`, font: 'Times New Roman', size: 22 }),
          new TextRun({ text: `Agenda         : ${variables.agenda || '-'}`, font: 'Times New Roman', size: 22 }),
        ],
      }),
      new Paragraph({
        spacing: { before: 120, after: 120 },
        indent: { left: 480 },
        children: [
          new TextRun({
            text: 'Mengingat pentingnya agenda rapat ini guna menyelaraskan program pendidikan anak-anak kita, kehadiran Bapak/Ibu sangat kami harapkan. Jika berhalangan hadir, mohon dapat mewakilkan dengan membawa surat kuasa.',
            font: 'Times New Roman',
            size: 22,
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: 'Demikian undangan ini kami sampaikan. Atas perhatian, kehadiran, dan kerja sama yang baik, kami ucapkan terima kasih.',
            font: 'Times New Roman',
            size: 22,
          }),
        ],
      })
    );
  } else {
    // Fallback simple rendering for other types
    bodyParagraphs.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: `Perihal: Penerbitan dokumen ${templateName} resmi.`, font: 'Times New Roman', size: 22 })],
      }),
      new Paragraph({
        spacing: { after: 240 },
        indent: { left: 480 },
        children: [
          new TextRun({
            text: 'Dokumen ini secara resmi dikeluarkan oleh instansi sekolah berdasarkan data yang sah. Variabel yang diisi pada aplikasi tercantum di bawah:',
            font: 'Times New Roman',
            size: 22,
          }),
        ],
      })
    );

    // List all variables
    Object.entries(variables).forEach(([k, v]) => {
      if (k !== 'nomor' && k !== 'tanggal_surat') {
        bodyParagraphs.push(
          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({ text: `${k.replace('_', ' ').toUpperCase()}: `, bold: true, font: 'Times New Roman', size: 20 }),
              new TextRun({ text: v, font: 'Times New Roman', size: 20 }),
            ],
          })
        );
      }
    });

    bodyParagraphs.push(
      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({
            text: 'Demikian surat ini dibuat untuk dapat dipergunakan sebagaimana mestinya.',
            font: 'Times New Roman',
            size: 22,
          }),
        ],
      })
    );
  }

  // 5. Signature Section
  const signatureTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            children: [],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Kepala Sekolah,\n\n\n\n\n', font: 'Times New Roman', size: 22 }),
                  new TextRun({ text: profile.principalName, bold: true, underline: {}, font: 'Times New Roman', size: 22 }),
                  new TextRun({ text: `\nNIP. ${profile.principalNip}`, font: 'Times New Roman', size: 22 }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // 6. Build Document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          kopTable,
          new Paragraph({ text: '', spacing: { before: 120 } }), // spacer
          metadataTable,
          recipientPara,
          ...bodyParagraphs,
          new Paragraph({ text: '', spacing: { before: 360 } }), // spacer
          signatureTable,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
