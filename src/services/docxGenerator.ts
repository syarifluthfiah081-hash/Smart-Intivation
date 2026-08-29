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

// Helper to convert base64 data url to Uint8Array for docx ImageRun
function base64ToUint8Array(base64: string): Uint8Array | null {
  if (!base64 || typeof base64 !== 'string') return null;
  try {
    const parts = base64.split(';base64,');
    const raw = parts.length > 1 ? parts[1] : parts[0];
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

// Convert HTML element to structured DOCX Paragraphs and Tables
function parseHtmlToDocxElements(html: string): (Paragraph | Table)[] {
  if (!html) return [];
  const elements: (Paragraph | Table)[] = [];
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.body;

    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          elements.push(
            new Paragraph({
              spacing: { after: 100, line: 276 },
              children: [new TextRun({ text, font: 'Times New Roman', size: 23 })],
            })
          );
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tagName = el.tagName.toLowerCase();

        // 1. Heading Elements (h1, h2, h3, h4)
        if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3' || tagName === 'h4') {
          const text = el.textContent?.trim() || '';
          const isCentered = el.classList.contains('text-center') || el.style.textAlign === 'center' || el.parentElement?.classList.contains('text-center');
          const isUnderlined = el.classList.contains('underline') || el.style.textDecoration.includes('underline');
          
          elements.push(
            new Paragraph({
              alignment: isCentered ? AlignmentType.CENTER : AlignmentType.LEFT,
              spacing: { before: 120, after: 80 },
              children: [
                new TextRun({
                  text,
                  bold: true,
                  underline: isUnderlined ? {} : undefined,
                  font: 'Times New Roman',
                  size: tagName === 'h1' ? 28 : tagName === 'h2' ? 26 : tagName === 'h3' ? 24 : 23,
                }),
              ],
            })
          );
        }

        // 2. Table Element
        else if (tagName === 'table') {
          const trs = el.querySelectorAll('tr');
          const tableRows: TableRow[] = [];

          trs.forEach(tr => {
            const tds = tr.querySelectorAll('td, th');
            const cells: TableCell[] = [];

            tds.forEach((td, idx) => {
              const text = td.textContent?.trim() || '';
              const isBold = td.querySelector('strong, b') !== null;
              const hasBorder = el.classList.contains('border') || td.classList.contains('border');

              cells.push(
                new TableCell({
                  width: { 
                    size: idx === 0 && tds.length > 1 ? 30 : idx === 1 && tds.length === 2 ? 70 : Math.floor(100 / tds.length), 
                    type: WidthType.PERCENTAGE 
                  },
                  borders: hasBorder ? {
                    top: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
                    bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
                    left: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
                    right: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
                  } : {
                    top: { style: BorderStyle.NONE },
                    bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE },
                  },
                  children: [
                    new Paragraph({
                      spacing: { after: 60, line: 260 },
                      children: [
                        new TextRun({
                          text,
                          bold: isBold,
                          font: 'Times New Roman',
                          size: 22,
                        }),
                      ],
                    }),
                  ],
                })
              );
            });

            if (cells.length > 0) {
              tableRows.push(new TableRow({ children: cells }));
            }
          });

          if (tableRows.length > 0) {
            elements.push(
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: tableRows,
              })
            );
          }
        }

        // 3. Paragraph & Div elements
        else if (tagName === 'p' || tagName === 'div' || tagName === 'li') {
          // If it's a container box (border & padding)
          const isBox = el.classList.contains('border') || el.classList.contains('bg-slate-50');
          const isCentered = el.classList.contains('text-center') || el.style.textAlign === 'center';
          const isRight = el.classList.contains('text-right') || el.style.textAlign === 'right';
          const isJustify = el.classList.contains('text-justify') || el.style.textAlign === 'justify';
          const isIndented = el.classList.contains('indent-8') || el.classList.contains('ml-6');

          // If container contains nested tables or child divs, process children
          if (el.querySelector('table, h1, h2, h3, h4') && tagName === 'div') {
            Array.from(el.childNodes).forEach(child => processNode(child));
            return;
          }

          const text = el.textContent?.trim() || '';
          if (text) {
            const isBold = el.querySelector('strong, b') !== null && el.children.length === 1;

            elements.push(
              new Paragraph({
                alignment: isCentered 
                  ? AlignmentType.CENTER 
                  : isRight 
                  ? AlignmentType.RIGHT 
                  : isJustify 
                  ? AlignmentType.JUSTIFIED 
                  : AlignmentType.LEFT,
                indent: isIndented ? { left: 480 } : undefined,
                spacing: { before: isBox ? 80 : 40, after: isBox ? 80 : 100, line: 276 },
                children: [
                  new TextRun({
                    text,
                    bold: isBold,
                    font: 'Times New Roman',
                    size: 23,
                  }),
                ],
              })
            );
          }
        } else {
          Array.from(node.childNodes).forEach(child => processNode(child));
        }
      }
    };

    Array.from(body.childNodes).forEach(child => processNode(child));
  } catch (err) {
    console.warn('Gagal mem-parsing HTML ke format DOCX:', err);
  }

  return elements;
}

export const exportToDocx = async (
  profile: SchoolProfile,
  templateName: string,
  variables: Record<string, string>,
  filename: string,
  customBodyHtml?: string
): Promise<void> => {
  // 1. Dual Logos
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

  // 2. Kop Surat Table
  const kopRows = [
    new TableRow({
      children: [
        // Left Logo Cell (16%)
        new TableCell({
          width: { size: 16, type: WidthType.PERCENTAGE },
          borders: {
            bottom: { style: BorderStyle.DOUBLE, size: 24, color: '000000' },
            top: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: leftLogoRun.length > 0 ? leftLogoRun : [new Paragraph({ text: '' })],
        }),

        // Center Info Cell (68%)
        new TableCell({
          width: { size: 68, type: WidthType.PERCENTAGE },
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
                spacing: { after: 20 },
                children: [
                  new TextRun({ text: profile.foundationName.toUpperCase(), bold: true, size: 21, font: 'Times New Roman' }),
                ],
              })
            ] : []),
            ...(profile.deptName ? profile.deptName.split('\n').map(line => 
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 20 },
                children: [
                  new TextRun({ text: line.toUpperCase(), bold: true, size: 21, font: 'Times New Roman' }),
                ],
              })
            ) : []),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 20, after: 30 },
              children: [
                new TextRun({ text: (profile.schoolName || 'SMK NEGERI 2 KOTA TIDORE KEPULAUAN').toUpperCase(), bold: true, size: 25, font: 'Times New Roman' }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 40 },
              children: [
                new TextRun({ 
                  text: `${profile.address || 'Jln.Raya Soasio-Rum Kel.Tomalou Kec.Tidore Selatan'}${profile.email ? `  E-Maile: ${profile.email}` : ''}`, 
                  size: 16, 
                  font: 'Times New Roman' 
                }),
              ],
            }),
          ],
        }),

        // Right Logo Cell (16%)
        new TableCell({
          width: { size: 16, type: WidthType.PERCENTAGE },
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

  // 3. Body Content
  let bodyElements: (Paragraph | Table)[] = [];

  if (customBodyHtml) {
    bodyElements = parseHtmlToDocxElements(customBodyHtml);
  }

  // 4. Signature Table (Mengetahui & Kepala Sekolah)
  const dateStr = `Tidore, ${formatDateIndo(variables.tanggal_surat || variables.tanggal_sk || variables.tanggal_diterima || new Date().toISOString())}`;
  
  const isDisposisi = templateName.toLowerCase().includes('disposisi');
  const isPernyataan = templateName.toLowerCase().includes('pernyataan');

  let signatureTable: Table | null = null;

  if (!isPernyataan && !isDisposisi) {
    signatureTable = new Table({
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
                  spacing: { line: 260 },
                  children: [
                    new TextRun({ text: `${dateStr}\n`, font: 'Times New Roman', size: 22 }),
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
  } else if (isDisposisi) {
    signatureTable = new Table({
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
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { line: 260 },
                  children: [
                    new TextRun({ text: 'Mengetahui / Menerima,\n\n\n\n\n', font: 'Times New Roman', size: 22 }),
                    new TextRun({ text: '( ............................................ )', bold: true, font: 'Times New Roman', size: 22 }),
                  ],
                }),
              ],
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
                  spacing: { line: 260 },
                  children: [
                    new TextRun({ text: `${dateStr}\n`, font: 'Times New Roman', size: 22 }),
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
  }

  // 5. Build Document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134, // ~20mm
              bottom: 1134,
              left: 1134,
              right: 1134,
            },
          },
        },
        children: [
          kopTable,
          new Paragraph({ text: '', spacing: { before: 180 } }),
          ...bodyElements,
          ...(signatureTable ? [
            new Paragraph({ text: '', spacing: { before: 240 } }),
            signatureTable,
          ] : []),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename || 'Dokumen_Surat'}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
