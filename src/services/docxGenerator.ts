import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  AlignmentType, 
  BorderStyle, 
  WidthType, 
  ImageRun 
} from 'docx';
import type { SchoolProfile } from '../components/LetterheadPreview';
import { formatDateIndo } from '../templates/letterTemplates';

// Helper to convert base64 data url or raw base64 to Uint8Array for docx ImageRun
function base64ToUint8Array(base64: string): Uint8Array | null {
  if (!base64 || typeof base64 !== 'string') return null;
  try {
    const parts = base64.split(';base64,');
    const raw = parts.length > 1 ? parts[1] : parts[0];
    
    // Validate if valid base64
    const cleanRaw = raw.replace(/\s/g, '');
    if (!/^[A-Za-z0-9+/=]+$/.test(cleanRaw)) {
      return null;
    }
    
    const binary = atob(cleanRaw);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    console.warn('Gagal decode base64 gambar untuk DOCX:', e);
    return null;
  }
}

// Convert HTML string to DOCX Paragraphs
function parseHtmlToDocxParagraphs(html: string): Paragraph[] {
  if (!html) return [];
  const paragraphs: Paragraph[] = [];
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.body;

    const traverse = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          paragraphs.push(
            new Paragraph({
              spacing: { after: 120 },
              children: [new TextRun({ text, font: 'Times New Roman', size: 22 })],
            })
          );
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tagName = el.tagName.toLowerCase();
        
        if (tagName === 'p' || tagName === 'div' || tagName === 'h1' || tagName === 'h2' || tagName === 'h3' || tagName === 'h4' || tagName === 'li') {
          const text = el.innerText?.trim();
          if (text) {
            const isBold = tagName.startsWith('h') || el.style.fontWeight === 'bold' || el.querySelector('b, strong') !== null;
            paragraphs.push(
              new Paragraph({
                spacing: { after: 120 },
                children: [
                  new TextRun({
                    text,
                    bold: isBold,
                    font: 'Times New Roman',
                    size: tagName === 'h1' ? 26 : tagName === 'h2' ? 24 : 22,
                  }),
                ],
              })
            );
          }
        } else if (tagName === 'table') {
          // Table element: extract rows as text paragraphs
          const rows = el.querySelectorAll('tr');
          rows.forEach(tr => {
            const cells = tr.querySelectorAll('td, th');
            const rowTexts: string[] = [];
            cells.forEach(td => rowTexts.push(td.textContent?.trim() || ''));
            if (rowTexts.length > 0) {
              paragraphs.push(
                new Paragraph({
                  spacing: { after: 80 },
                  indent: { left: 360 },
                  children: [
                    new TextRun({
                      text: rowTexts.join(' : '),
                      font: 'Times New Roman',
                      size: 21,
                    }),
                  ],
                })
              );
            }
          });
        } else {
          node.childNodes.forEach(child => traverse(child));
        }
      }
    };

    body.childNodes.forEach(child => traverse(child));
  } catch (err) {
    console.warn('Gagal mem-parsing HTML ke format DOCX:', err);
  }

  return paragraphs;
}

export const exportToDocx = async (
  profile: SchoolProfile,
  templateName: string,
  variables: Record<string, string>,
  filename: string,
  customBodyHtml?: string
): Promise<void> => {
  // 1. Setup Dual Logos (Kiri & Kanan)
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
            ...(profile.foundationName ? [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: profile.foundationName.toUpperCase(), bold: true, size: 20, font: 'Times New Roman' }),
                ],
              })
            ] : []),
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
                new TextRun({ text: (profile.schoolName || 'SMK NEGERI 2 KOTA TIDORE KEPULAUAN').toUpperCase(), bold: true, size: 24, font: 'Times New Roman' }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ 
                  text: `${profile.address || 'Jln.Raya Soasio-Rum Kel.Tomalou Kec.Tidore Selatan'}${profile.email ? `  E-Maile: ${profile.email}` : ''}`, 
                  size: 16, 
                  font: 'Times New Roman' 
                }),
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

  // 4. Letter Body Paragraphs
  let bodyParagraphs: Paragraph[] = [];

  if (customBodyHtml) {
    bodyParagraphs = parseHtmlToDocxParagraphs(customBodyHtml);
  }

  // Fallback if parsed HTML paragraphs are empty
  if (bodyParagraphs.length === 0) {
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
            text: `Surat dinas ini resmi dikeluarkan oleh ${profile.schoolName || 'SMK Negeri 2 Kota Tidore Kepulauan'} terkait perihal "${templateName}". Rincian variabel yang tercatat adalah sebagai berikut:`,
            font: 'Times New Roman',
            size: 22,
          }),
        ],
      })
    );

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
  }

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
            children: [new Paragraph({ text: '' })],
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
                  new TextRun({ text: profile.principalName || 'Ali Djumati.S.Pd.,M.Si', bold: true, underline: {}, font: 'Times New Roman', size: 22 }),
                  new TextRun({ text: `\nNIP. ${profile.principalNip || '1977601062003121005'}`, font: 'Times New Roman', size: 22 }),
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
          new Paragraph({ text: '', spacing: { before: 120 } }),
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
  a.download = `${filename || 'Surat_Dinas'}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
