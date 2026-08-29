import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, BorderStyle, WidthType, ImageRun } from 'docx';
import type { SchoolProfile } from '../components/LetterheadPreview';
import { formatDateIndo } from '../templates/letterTemplates';

// Helper to convert base64 data url to Uint8Array for docx ImageRun
function base64ToUint8Array(base64: string): Uint8Array | null {
  try {
    const parts = base64.split(';base64,');
    const raw = parts.length > 1 ? parts[1] : parts[0];
    const binary = atob(raw);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    console.warn('Gagal decode base64 gambar untuk docx:', e);
    return null;
  }
}

export const exportToDocx = async (
  profile: SchoolProfile,
  templateName: string,
  variables: Record<string, string>,
  filename: string
): Promise<void> => {
  // 1. Setup Dual Logos (Kiri Hijau & Kanan Biru)
  let leftLogoRun: Paragraph[] = [];
  let rightLogoRun: Paragraph[] = [];

  if (profile.logoUrl) {
    const leftBytes = base64ToUint8Array(profile.logoUrl);
    if (leftBytes) {
      leftLogoRun = [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: leftBytes,
              transformation: { width: 65, height: 65 },
            } as any),
          ],
        }),
      ];
    }
  }

  if (profile.logoKananUrl) {
    const rightBytes = base64ToUint8Array(profile.logoKananUrl);
    if (rightBytes) {
      rightLogoRun = [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: rightBytes,
              transformation: { width: 65, height: 65 },
            } as any),
          ],
        }),
      ];
    }
  }

  // 2. Kop Surat Table with Left Logo, Center Text, Right Logo
  const kopRows = [
    new TableRow({
      children: [
        // Left Logo Cell (18%)
        new TableCell({
          width: { size: 18, type: WidthType.PERCENTAGE },
          borders: {
            bottom: { style: BorderStyle.DOUBLE, size: 24, color: '000000' },
            top: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: leftLogoRun.length > 0 ? leftLogoRun : [new Paragraph({ text: '' })],
        }),

        // Center Info Cell (64%)
        new TableCell({
          width: { size: 64, type: WidthType.PERCENTAGE },
          borders: {
            bottom: { style: BorderStyle.DOUBLE, size: 24, color: '000000' },
            top: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            ...(profile.deptName ? profile.deptName.split('\n').map(line => 
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: line.toUpperCase(), bold: true, size: 20, font: 'Times New Roman' }),
                ],
              })
            ) : []),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: profile.schoolName.toUpperCase(), bold: true, size: 24, font: 'Times New Roman' }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: `${profile.address || 'Jln.Raya Soasio-Rum Kel.Tomalou Kec.Tidore Selatan'}${profile.email ? `  E-Maile:${profile.email}` : ''}`, size: 16, font: 'Times New Roman' }),
              ],
            }),
            new Paragraph({ text: '' }),

          ],
        }),

        // Right Logo Cell (18%)
        new TableCell({
          width: { size: 18, type: WidthType.PERCENTAGE },
          borders: {
            bottom: { style: BorderStyle.DOUBLE, size: 24, color: '000000' },
            top: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: rightLogoRun.length > 0 ? rightLogoRun : [new Paragraph({ text: '' })],
        }),
      ],
    }),
  ];

  const kopTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: kopRows,
  });

  // 3. Metadata Section (Nomor, Lampiran, Tanggal)
  const dateStr = `Tidore, ${formatDateIndo(variables.tanggal_surat || variables.tanggal_sk || variables.tanggal_diterima || new Date().toISOString())}`;
  
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
                new TextRun({ text: `Nomor     : ${variables.nomor || variables.nomor_agenda || '-'}`, font: 'Times New Roman', size: 22 }),
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

  // 4. Letter Content Body Paragraphs
  const bodyParagraphs: Paragraph[] = [];

  // Recipient if applicable
  const recipientName = variables.penerima || variables.penerima_tujuan || variables.nama_ortu || '';
  if (recipientName) {
    bodyParagraphs.push(
      new Paragraph({
        spacing: { before: 240, after: 240 },
        children: [
          new TextRun({ text: 'Kepada Yth.\n', font: 'Times New Roman', size: 22 }),
          new TextRun({ text: `${recipientName}\n`, bold: true, font: 'Times New Roman', size: 22 }),
          new TextRun({ text: 'di Tempat', font: 'Times New Roman', size: 22 }),
        ],
      })
    );
  }

  bodyParagraphs.push(
    new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun({ text: 'Dengan hormat,', font: 'Times New Roman', size: 22 })],
    }),
    new Paragraph({
      spacing: { after: 200 },
      indent: { left: 480 },
      children: [
        new TextRun({
          text: `Surat dinas ini resmi dikeluarkan oleh SMK Negeri 2 Kota Tidore Kepulauan terkait perihal "${templateName}". Rincian variabel yang tercatat adalah sebagai berikut:`,
          font: 'Times New Roman',
          size: 22,
        }),
      ],
    })
  );

  // List all key variables
  Object.entries(variables).forEach(([k, v]) => {
    if (k !== 'nomor' && k !== 'tanggal_surat' && k !== 'lampiran') {
      bodyParagraphs.push(
        new Paragraph({
          indent: { left: 720 },
          children: [
            new TextRun({ text: `${k.replace(/_/g, ' ').toUpperCase()}: `, bold: true, font: 'Times New Roman', size: 21 }),
            new TextRun({ text: `${v}`, font: 'Times New Roman', size: 21 }),
          ],
        })
      );
    }
  });

  bodyParagraphs.push(
    new Paragraph({
      spacing: { before: 240, after: 120 },
      indent: { left: 480 },
      children: [
        new TextRun({
          text: 'Demikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.',
          font: 'Times New Roman',
          size: 22,
        }),
      ],
    })
  );

  // 5. Signature Section
  const signatureTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            children: [],
          }),
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
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
                  new TextRun({ text: `Tidore, ${formatDateIndo(variables.tanggal_surat || new Date().toISOString())}\n`, font: 'Times New Roman', size: 22 }),
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
          new Paragraph({ text: '', spacing: { before: 120 } }),
          metadataTable,
          ...bodyParagraphs,
          new Paragraph({ text: '', spacing: { before: 360 } }),
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
