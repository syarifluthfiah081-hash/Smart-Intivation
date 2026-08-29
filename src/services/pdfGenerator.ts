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
    // 2. Render ke canvas dengan resolusi tinggi
    const canvas = await html2canvas(element, {
      scale: 2.5, // 300 DPI clarity
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.offsetWidth || 794,
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
