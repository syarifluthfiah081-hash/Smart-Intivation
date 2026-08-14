import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPdf = async (elementId: string, filename: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Elemen pratinjau surat tidak ditemukan!');
  }

  // Sembunyikan garis pinggir luar jika ada saat rendering
  const originalBorder = element.style.border;
  element.style.border = 'none';

  try {
    const canvas = await html2canvas(element, {
      scale: 2.5, // Meningkatkan DPI resolusi rendering teks agar tidak kabur
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Inisialisasi dokumen jsPDF (A4 ukuran: 210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; 
    const pageHeight = 297; 
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Tambah halaman pertama
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Handling multi-halaman jika surat lebih panjang dari 1 halaman A4
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  } finally {
    element.style.border = originalBorder;
  }
};
