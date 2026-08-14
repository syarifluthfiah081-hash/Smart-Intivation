import React, { useState, useEffect } from 'react';
import { getSchoolProfile, addLetterToHistory, saveLetterHistory, getLetterHistory } from '../services/storage';
import type { GeneratedLetter } from '../services/storage';
import type { SchoolProfile } from '../components/LetterheadPreview';
import { LetterheadPreview } from '../components/LetterheadPreview';
import { letterTemplates } from '../templates/letterTemplates';
import type { LetterTemplate } from '../templates/letterTemplates';
import { exportToPdf } from '../services/pdfGenerator';
import { exportToDocx } from '../services/docxGenerator';
import { Printer, FileDown, Save, Eye, AlertCircle, RefreshCw } from 'lucide-react';

interface CreateLetterProps {
  editLetterData: GeneratedLetter | null;
  onClearEdit: () => void;
  initialTemplateId: string | null;
  onClearInitialTemplate: () => void;
  onNavigateToHistory: () => void;
}

export const CreateLetter: React.FC<CreateLetterProps> = ({ 
  editLetterData, 
  onClearEdit, 
  initialTemplateId,
  onClearInitialTemplate,
  onNavigateToHistory 
}) => {
  const [profile, setProfile] = useState<SchoolProfile | null>(null);
  
  // Active template state
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate>(letterTemplates[0]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [paperSize, setPaperSize] = useState<'a4' | 'f4'>('a4');
  
  const [isExporting, setIsExporting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load School Profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getSchoolProfile();
        setProfile(data);
      } catch (err) {
        console.error('Gagal mengambil profil sekolah:', err);
      }
    };
    loadProfile();
  }, []);

  // Handle template selection from dashboard shortcuts
  useEffect(() => {
    if (initialTemplateId && !editLetterData) {
      const template = letterTemplates.find(t => t.id === initialTemplateId);
      if (template) {
        setSelectedTemplate(template);
        // Initialize form variables
        const initialVals: Record<string, string> = {};
        template.fields.forEach(field => {
          initialVals[field.key] = field.defaultValue;
        });
        setFormValues(initialVals);
      }
      onClearInitialTemplate();
    }
  }, [initialTemplateId, editLetterData]);

  // Handle Edit/Prepopulate letter data from History
  useEffect(() => {
    if (editLetterData) {
      const template = letterTemplates.find(t => t.id === editLetterData.typeId);
      if (template) {
        setSelectedTemplate(template);
        setFormValues(editLetterData.variables);
      }
    } else {
      // Default initialization if no edit and no initial shortcut template
      if (!initialTemplateId) {
        initializeForm(letterTemplates[0]);
      }
    }
  }, [editLetterData]);

  const initializeForm = (template: LetterTemplate) => {
    const initialVals: Record<string, string> = {};
    template.fields.forEach(field => {
      initialVals[field.key] = field.defaultValue;
    });
    setFormValues(initialVals);
    setIsSaved(false);
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    const template = letterTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      initializeForm(template);
      if (editLetterData) {
        onClearEdit(); // Cancel edit mode if user manually changes template
      }
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [key]: value,
    }));
    setIsSaved(false);
  };

  const handleResetForm = () => {
    if (window.confirm('Apakah Anda yakin ingin mereset formulir ini ke nilai bawaan?')) {
      initializeForm(selectedTemplate);
    }
  };

  // Helper untuk generate nama file ekspor
  const getFilename = () => {
    const docName = selectedTemplate.name.replace(/\s+/g, '_');
    const recipient = (formValues.penerima || formValues.nama_siswa || formValues.nama_petugas || 'Dokumen').replace(/\s+/g, '_');
    return `${docName}_${recipient}`;
  };

  // 1. Simpan Ke Riwayat Surat
  const handleSaveToHistory = async (): Promise<string> => {
    if (!profile) return '';

    const refNumber = formValues.nomor || '-';
    const recipientName = formValues.penerima || formValues.nama_siswa || formValues.nama_petugas || 'Pihak Terkait';

    try {
      // Jika sedang dalam mode edit surat lama, update surat tersebut
      if (editLetterData) {
        const history = await getLetterHistory();
        const idx = history.findIndex(item => item.id === editLetterData.id);
        if (idx !== -1) {
          const updatedLetter: GeneratedLetter = {
            ...editLetterData,
            refNumber,
            recipientName,
            variables: formValues,
          };
          history[idx] = updatedLetter;
          await saveLetterHistory(history);
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 3000);
          return editLetterData.id;
        }
      }

      // Jika membuat surat baru
      const newLetter = await addLetterToHistory({
        typeId: selectedTemplate.id,
        typeName: selectedTemplate.name,
        refNumber,
        recipientName,
        variables: formValues,
      });
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      return newLetter.id;
    } catch (err) {
      console.error('Gagal menyimpan riwayat surat:', err);
      alert('Gagal menyimpan riwayat surat ke database.');
      return '';
    }
  };

  // 2. Trigger Print Browser
  const handlePrint = async () => {
    await handleSaveToHistory();
    // Berikan sedikit jeda agar DOM ter-update setelah save state
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // 3. Ekspor PDF
  const handleExportPdf = async () => {
    await handleSaveToHistory();
    setIsExporting(true);
    try {
      await exportToPdf('letter-paper-render', getFilename());
    } catch (err) {
      alert('Gagal mengekspor PDF: ' + err);
    } finally {
      setIsExporting(false);
    }
  };

  // 4. Ekspor Word
  const handleExportDocx = async () => {
    if (!profile) return;
    await handleSaveToHistory();
    setIsExporting(true);
    try {
      await exportToDocx(profile, selectedTemplate.name, formValues, getFilename());
    } catch (err) {
      alert('Gagal mengekspor Word: ' + err);
    } finally {
      setIsExporting(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Visual HTML Content for dynamic letter body
  const previewBodyHtml = selectedTemplate.generatePreviewHtml(formValues, profile);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">
            {editLetterData ? 'Edit Dokumen Riwayat' : 'Buat Dokumen Baru'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {editLetterData 
              ? `Mengedit dokumen: ${editLetterData.typeName} (Nomor: ${editLetterData.refNumber})`
              : 'Pilih tipe surat, isi variabel formulir di sebelah kiri, dan lihat pratinjau kertasnya di sebelah kanan.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {editLetterData && (
            <button
              onClick={onClearEdit}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Batal Edit
            </button>
          )}
          <button
            onClick={onNavigateToHistory}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Lihat Riwayat Surat
          </button>
        </div>
      </div>

      {/* Editor & Preview Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Input Form Controls (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6 no-print">
          
          {/* Settings Section (Template Selector & Paper Size) */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pengaturan Dasar Dokumen</h3>
            
            {/* Template Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Jenis Dokumen / Surat</label>
              <select
                value={selectedTemplate.id}
                onChange={handleTemplateChange}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl transition-all font-semibold text-slate-800"
              >
                {letterTemplates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Paper Size selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Ukuran Kertas Pratinjau</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaperSize('a4')}
                  className={`py-2 px-3 border rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    paperSize === 'a4'
                      ? 'bg-blue-600/10 border-blue-500 text-blue-600'
                      : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Kertas A4 (210mm x 297mm)
                </button>
                <button
                  type="button"
                  onClick={() => setPaperSize('f4')}
                  className={`py-2 px-3 border rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    paperSize === 'f4'
                      ? 'bg-blue-600/10 border-blue-500 text-blue-600'
                      : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Kertas F4 / Legal (215mm x 330mm)
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Variable Inputs Form */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Variabel Konten Surat</h3>
              <button
                onClick={handleResetForm}
                className="text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Default</span>
              </button>
            </div>

            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              {selectedTemplate.fields.map(field => (
                <div key={field.key} className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600">{field.label}</label>
                  
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formValues[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={4}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl transition-all"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formValues[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl transition-all font-medium text-slate-700"
                    >
                      {field.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={formValues[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl transition-all"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi Penerbitan Dokumen</h4>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Print */}
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Cetak Langsung
              </button>

              {/* Save Only */}
              <button
                type="button"
                onClick={handleSaveToHistory}
                className={`flex items-center justify-center gap-2 py-3 border text-white font-bold rounded-xl text-xs transition-all cursor-pointer ${
                  isSaved 
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'border-slate-800 bg-slate-950/40 hover:bg-slate-800'
                }`}
              >
                <Save className="w-4 h-4" />
                {isSaved ? 'Tersimpan!' : 'Simpan Riwayat'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* PDF Export */}
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold rounded-xl text-xs transition-all border border-slate-700 cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-rose-400" />
                Ekspor PDF
              </button>

              {/* DOCX Export */}
              <button
                type="button"
                onClick={handleExportDocx}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold rounded-xl text-xs transition-all border border-slate-700 cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-blue-400" />
                Ekspor Word
              </button>
            </div>

            <div className="flex gap-2 p-3 bg-slate-950/40 border border-slate-800 rounded-xl mt-3 text-[10px] text-slate-400">
              <AlertCircle className="w-4.5 h-4.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p>
                Mengekspor berkas ke PDF atau Word akan otomatis menyimpan surat ini beserta variabelnya ke log Riwayat Surat Anda.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Paper Canvas Preview (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-100 p-4 border border-slate-200 rounded-2xl lg:sticky lg:top-24">
            
            {/* Top Preview controller (no-print) */}
            <div className="flex items-center justify-between mb-3 no-print">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-500" />
                Lembar Cetakan Kertas
              </span>
              <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase">
                Skala Cetak 1:1
              </span>
            </div>

            {/* Simulated Paper Wrapper */}
            <div className="w-full bg-slate-200 border border-slate-300 rounded-xl overflow-x-auto shadow-inner p-4 flex justify-center">
              
              {/* Outer paper container that will be exported to canvas/pdf */}
              <div 
                id="letter-paper-render"
                className={`paper-preview ${
                  paperSize === 'a4' ? 'paper-a4' : 'paper-f4'
                } print:shadow-none print:border-none`}
              >
                {/* 1. Letterhead */}
                <LetterheadPreview profile={profile} />

                {/* 2. Custom Letter Body (Using Template specific renderer) */}
                <div dangerouslySetInnerHTML={{ __html: previewBodyHtml }} />

                {/* 3. Signature Area (Standard Titimangsa and Principal info) */}
                <div className="mt-8 flex justify-end text-black font-serif text-[12px] avoid-break">
                  <div className="w-[200px] text-center">
                    <p>Kepala Sekolah,</p>
                    {/* Space for signing */}
                    <div className="h-[80px] print:h-[60px] no-print flex items-center justify-center text-slate-300 text-[10px] border border-dashed border-slate-200 rounded my-2">
                      Ruang Tanda Tangan & Stempel
                    </div>
                    {/* Spacer for printable signatures */}
                    <div className="hidden print:block h-[60px]"></div>
                    
                    <p className="font-bold underline leading-snug">{profile.principalName}</p>
                    <p className="text-[11px] leading-tight">NIP. {profile.principalNip}</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
