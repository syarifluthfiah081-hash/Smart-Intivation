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

  // Simpan style asli
  const originalBoxShadow = element.style.boxShadow;
  const originalBorder = element.style.border;
  element.style.boxShadow = 'none';
  element.style.border = 'none';

  try {
    const canvas = await html2canvas(element, {
      scale: 2.5, // Meningkatkan resolusi agar teks tajam
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // Dimensi halaman dalam mm
    const isF4 = paperFormat === 'f4';
    const pageWidth = isF4 ? 215 : 210;
    const pageHeight = isF4 ? 330 : 297;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: isF4 ? [215, 330] : 'a4',
    });

    const imgWidth = pageWidth; 
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Halaman pertama
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Halaman selanjutnya jika ada
    while (heightLeft > 5) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename || 'Surat_Dinas'}.pdf`);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error(`Gagal membuat berkas PDF: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    element.style.boxShadow = originalBoxShadow;
    element.style.border = originalBorder;
  }
};
