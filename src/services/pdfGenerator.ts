import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPdf = async (
  elementId: string, 
  filename: string, 
  paperFormat: 'a4' | 'f4' = 'a4'
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Elemen pratinjau surat tidak ditemukan di layar!');
  }

  // 1. Dapatkan referensi semua elemen no-print dan editable di dalam dokumen
  const noPrintElements = element.querySelectorAll<HTMLElement>('.no-print');
  const printOnlyElements = element.querySelectorAll<HTMLElement>('.print-only, .hidden.print\\:block');
  const editableBoxes = element.querySelectorAll<HTMLElement>('.editable-box, .editable-active');

  // Simpan style awal untuk direstore nanti
  const originalDisplayStates: string[] = [];
  noPrintElements.forEach(el => {
    originalDisplayStates.push(el.style.display);
    el.style.setProperty('display', 'none', 'important');
  });

  const originalPrintOnlyStates: string[] = [];
  printOnlyElements.forEach(el => {
    originalPrintOnlyStates.push(el.style.display);
    el.style.setProperty('display', 'block', 'important');
  });

  const originalEditableStyles: Array<{ border: string; bg: string; shadow: string; padding: string }> = [];
  editableBoxes.forEach(el => {
    originalEditableStyles.push({
      border: el.style.border,
      bg: el.style.backgroundColor,
      shadow: el.style.boxShadow,
      padding: el.style.padding,
    });
    el.style.border = 'none';
    el.style.backgroundColor = 'transparent';
    el.style.boxShadow = 'none';
    el.style.padding = '0';
  });

  const originalBoxShadow = element.style.boxShadow;
  const originalBorder = element.style.border;
  element.style.boxShadow = 'none';
  element.style.border = 'none';

  try {
    // 2. Render ke canvas dengan resolusi tinggi dan proteksi sanitasi OKLCH untuk Tailwind 4
    const canvas = await html2canvas(element, {
      scale: 2.5, // 300 DPI high clarity
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.offsetWidth || 794,
      onclone: (clonedDoc: Document) => {
        // Hapus link stylesheet eksternal Tailwind 4 yang mengandung fungsi oklch()
        const links = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
        links.forEach(link => link.remove());

        // Sanitasi semua tag <style> di dalam dokumen klon
        const styleTags = clonedDoc.querySelectorAll('style');
        styleTags.forEach(styleTag => {
          if (styleTag.innerHTML) {
            styleTag.innerHTML = styleTag.innerHTML.replace(/oklch\([^)]+\)/gi, '#1e293b');
          }
        });

        // Suntikkan CSS resmi murni bebas oklch dengan ukuran logo proporsional
        const cleanStyle = clonedDoc.createElement('style');
        cleanStyle.innerHTML = `
          * {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          body, html {
            background-color: #ffffff !important;
            color: #000000 !important;
            font-family: "Times New Roman", Times, serif !important;
            margin: 0;
            padding: 0;
          }
          .paper-preview {
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 auto !important;
            padding: 20mm !important;
            width: 210mm !important;
            font-family: "Times New Roman", Times, serif !important;
          }
          .paper-a4 {
            width: 210mm !important;
            min-height: 297mm !important;
          }
          .paper-f4 {
            width: 215mm !important;
            min-height: 330mm !important;
          }

          /* Logo KOP Surat Presisi Proporsional (Maksimal 60px) */
          img {
            max-width: 60px !important;
            max-height: 60px !important;
            width: 60px !important;
            height: 60px !important;
            object-fit: contain !important;
            display: block !important;
            margin: 0 auto !important;
          }
          .w-\\[60px\\], .w-\\[72px\\] {
            width: 60px !important;
            height: 60px !important;
            min-width: 60px !important;
            max-width: 60px !important;
            max-height: 60px !important;
          }

          /* Garis Ganda KOP Surat Bersih & Proporsional */
          .kop-line {
            border-top: 2px solid #000000 !important;
            border-bottom: 0.8px solid #000000 !important;
            height: 2px !important;
            margin-top: 4px !important;
            margin-bottom: 12px !important;
          }

          .no-print {
            display: none !important;
          }
          .editable-box, .editable-active {
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          td, th {
            color: #000000 !important;
            padding: 2px 0 !important;
            font-size: 12px !important;
            font-family: "Times New Roman", Times, serif !important;
          }
          h1, h2, h3, h4, h5, h6, p, span, strong, b, u, em, td, th {
            color: #000000 !important;
            font-family: "Times New Roman", Times, serif !important;
          }
          .text-center { text-align: center !important; }
          .text-right { text-align: right !important; }
          .text-left { text-align: left !important; }
          .text-justify { text-align: justify !important; }
          .font-bold, strong, b { font-weight: bold !important; }
          .underline { text-decoration: underline !important; }
          .uppercase { text-transform: uppercase !important; }
          .indent-8 { text-indent: 2rem !important; }
          .flex { display: flex !important; }
          .justify-between { justify-content: space-between !important; }
          .justify-end { justify-content: flex-end !important; }
          .items-center { align-items: center !important; }
          .items-start { align-items: flex-start !important; }
          .border { border: 1px solid #000000 !important; }
          .border-black { border-color: #000000 !important; }
          .p-3 { padding: 0.75rem !important; }
          .mt-1 { margin-top: 0.25rem !important; }
          .mt-2 { margin-top: 0.5rem !important; }
          .mt-4 { margin-top: 1rem !important; }
          .mt-6 { margin-top: 1.5rem !important; }
          .mt-8 { margin-top: 2rem !important; }
          .mb-2 { margin-bottom: 0.5rem !important; }
          .mb-3 { margin-bottom: 0.75rem !important; }
          .mb-4 { margin-bottom: 1rem !important; }
          .mb-5 { margin-bottom: 1.25rem !important; }
          .mb-8 { margin-bottom: 2rem !important; }
          .ml-6 { margin-left: 1.5rem !important; }
          .w-full { width: 100% !important; }
          .w-40, .w-36 { width: 150px !important; }
          .w-20 { width: 80px !important; }
        `;
        clonedDoc.head.appendChild(cleanStyle);

        // Bersihkan inline style pada semua elemen klon
        const allClonedElements = clonedDoc.querySelectorAll<HTMLElement>('*');
        allClonedElements.forEach(el => {
          const s = el.getAttribute('style');
          if (s && s.includes('oklch')) {
            el.setAttribute('style', s.replace(/oklch\([^)]+\)/gi, '#000000'));
          }
        });
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    
    // 3. Format ukuran halaman PDF
    const isF4 = paperFormat === 'f4';
    const pageWidth = isF4 ? 215 : 210;
    const pageHeight = isF4 ? 330 : 297;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: isF4 ? [215, 330] : 'a4',
      compress: true,
    });

    const imgWidth = pageWidth; 
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Halaman 1
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Tambah halaman jika surat melebihi 1 halaman
    while (heightLeft > 5) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename || 'Dokumen_Surat'}.pdf`);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error(`Gagal membuat berkas PDF: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    // 4. Restore semua style ke kondisi semula
    element.style.boxShadow = originalBoxShadow;
    element.style.border = originalBorder;

    noPrintElements.forEach((el, i) => {
      el.style.display = originalDisplayStates[i] || '';
    });

    printOnlyElements.forEach((el, i) => {
      el.style.display = originalPrintOnlyStates[i] || '';
    });

    editableBoxes.forEach((el, i) => {
      if (originalEditableStyles[i]) {
        el.style.border = originalEditableStyles[i].border;
        el.style.backgroundColor = originalEditableStyles[i].bg;
        el.style.boxShadow = originalEditableStyles[i].shadow;
        el.style.padding = originalEditableStyles[i].padding;
      }
    });
  }
};
