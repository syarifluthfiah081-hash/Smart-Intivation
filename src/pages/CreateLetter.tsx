import React, { useState, useEffect, useRef } from 'react';
import { 
  getSchoolProfile, 
  saveSchoolProfile, 
  addLetterToHistory, 
  saveLetterHistory, 
  getLetterHistory 
} from '../services/storage';
import type { GeneratedLetter } from '../services/storage';
import type { SchoolProfile } from '../components/LetterheadPreview';
import { LetterheadPreview, DEFAULT_SCHOOL_PROFILE } from '../components/LetterheadPreview';
import { letterTemplates, formatDateIndo } from '../templates/letterTemplates';
import type { LetterTemplate } from '../templates/letterTemplates';
import { exportToPdf } from '../services/pdfGenerator';
import { exportToDocx } from '../services/docxGenerator';
import { LOGO_KIRI_DEFAULT, LOGO_KANAN_DEFAULT } from '../assets/defaultLogos';
import { 
  Printer, 
  FileDown, 
  Save, 
  Eye, 
  AlertCircle, 
  RefreshCw, 
  Edit3, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Check,
  Code,
  CheckCircle2
} from 'lucide-react';

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
  const [profile, setProfile] = useState<SchoolProfile>(DEFAULT_SCHOOL_PROFILE);
  
  // Active template state
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate>(letterTemplates[0]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [paperSize, setPaperSize] = useState<'a4' | 'f4'>('a4');
  
  // Direct inline visual editing mode
  const [isInlineEditing, setIsInlineEditing] = useState(true);
  const [customBodyHtml, setCustomBodyHtml] = useState<string>('');
  const [isHtmlModalOpen, setIsHtmlModalOpen] = useState(false);
  const [rawHtmlInput, setRawHtmlInput] = useState('');

  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'word' | 'print' | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const editableRef = useRef<HTMLDivElement>(null);

  // Load School Profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getSchoolProfile();
        const fullData = {
          ...DEFAULT_SCHOOL_PROFILE,
          ...data,
          logoUrl: data.logoUrl || LOGO_KIRI_DEFAULT,
          logoKananUrl: data.logoKananUrl || LOGO_KANAN_DEFAULT,
        };
        setProfile(fullData);
      } catch (err) {
        console.warn('Gagal mengambil profil sekolah, menggunakan default:', err);
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
        const initialVals: Record<string, string> = {};
        template.fields.forEach(field => {
          initialVals[field.key] = field.defaultValue;
        });
        setFormValues(initialVals);
        setCustomBodyHtml(''); // Reset custom body so template generator runs
      }
      onClearInitialTemplate();
    }
  }, [initialTemplateId, editLetterData]);

  // Handle Edit/Prepopulate letter data from History
  useEffect(() => {
    if (editLetterData) {
      const template = letterTemplates.find(t => t.id === editLetterData.typeId) || letterTemplates[0];
      setSelectedTemplate(template);
      setFormValues(editLetterData.variables);
      if (editLetterData.customBodyHtml) {
        setCustomBodyHtml(editLetterData.customBodyHtml);
      } else {
        setCustomBodyHtml('');
      }
    } else {
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
    setCustomBodyHtml('');
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
    setFormValues(prev => {
      const updated = { ...prev, [key]: value };
      // Regenerate template HTML when form values change
      if (profile) {
        setCustomBodyHtml(selectedTemplate.generatePreviewHtml(updated, profile));
      }
      return updated;
    });
    setIsSaved(false);
  };

  // Sync initial generated HTML when profile is loaded or template changes
  useEffect(() => {
    if (profile && !customBodyHtml && (!editLetterData || !editLetterData.customBodyHtml)) {
      setCustomBodyHtml(selectedTemplate.generatePreviewHtml(formValues, profile));
    }
  }, [profile, selectedTemplate]);

  const handleResetForm = () => {
    if (window.confirm('Apakah Anda yakin ingin mereset formulir dan seluruh teks surat ke nilai bawaan template?')) {
      initializeForm(selectedTemplate);
      if (profile) {
        const initialVals: Record<string, string> = {};
        selectedTemplate.fields.forEach(field => {
          initialVals[field.key] = field.defaultValue;
        });
        setCustomBodyHtml(selectedTemplate.generatePreviewHtml(initialVals, profile));
      }
    }
  };

  // Handle direct contentEditable blur/input
  const handleContentInput = () => {
    if (editableRef.current) {
      setCustomBodyHtml(editableRef.current.innerHTML);
      setIsSaved(false);
    }
  };

  // Rich Text Execution Helpers
  const executeCommand = (cmd: string, val: string = '') => {
    document.execCommand(cmd, false, val);
    if (editableRef.current) {
      setCustomBodyHtml(editableRef.current.innerHTML);
    }
  };

  // Helper untuk generate nama file ekspor
  const getFilename = () => {
    const docName = selectedTemplate.name.replace(/\s+/g, '_');
    const recipient = (
      formValues.penerima || 
      formValues.nama_siswa || 
      formValues.nama_guru || 
      formValues.nama_petugas || 
      formValues.nama_pihak || 
      'Dokumen'
    ).replace(/\s+/g, '_');
    return `${docName}_${recipient}`;
  };

  // ================= DIRECT ON-PAPER KOP SURAT EDIT HANDLERS =================
  const handleKopChange = (field: keyof SchoolProfile, val: string) => {
    setProfile(prev => {
      const updated = { ...prev, [field]: val };
      saveSchoolProfile(updated).catch(() => {});
      return updated;
    });
  };

  const handleLogoChange = (side: 'kiri' | 'kanan', base64: string) => {
    setProfile(prev => {
      const updated = side === 'kiri' 
        ? { ...prev, logoUrl: base64 } 
        : { ...prev, logoKananUrl: base64 };
      saveSchoolProfile(updated).catch(() => {});
      return updated;
    });
  };

  // ================= DOCUMENT ACTIONS =================

  // 1. Simpan Ke Riwayat Surat
  const handleSaveToHistory = async (): Promise<string> => {
    const finalBodyHtml = editableRef.current ? editableRef.current.innerHTML : customBodyHtml;

    const refNumber = formValues.nomor || formValues.nomor_agenda || '-';
    const recipientName = 
      formValues.penerima || 
      formValues.nama_siswa || 
      formValues.nama_guru || 
      formValues.nama_petugas || 
      formValues.nama_pihak || 
      formValues.penerima_tujuan || 
      formValues.surat_dari || 
      'Pihak Terkait';

    try {
      if (editLetterData) {
        const history = await getLetterHistory();
        const idx = history.findIndex(item => item.id === editLetterData.id);
        if (idx !== -1) {
          const updatedLetter: GeneratedLetter = {
            ...editLetterData,
            refNumber,
            recipientName,
            variables: formValues,
            customBodyHtml: finalBodyHtml,
          };
          history[idx] = updatedLetter;
          await saveLetterHistory(history);
          setIsSaved(true);
          setActionSuccessMsg('✓ Perubahan surat berhasil disimpan ke riwayat!');
          setTimeout(() => {
            setIsSaved(false);
            setActionSuccessMsg('');
          }, 3000);
          return editLetterData.id;
        }
      }

      const newLetter = await addLetterToHistory({
        typeId: selectedTemplate.id,
        typeName: selectedTemplate.name,
        refNumber,
        recipientName,
        variables: formValues,
        customBodyHtml: finalBodyHtml,
      });
      
      setIsSaved(true);
      setActionSuccessMsg('✓ Surat baru berhasil disimpan ke riwayat!');
      setTimeout(() => {
        setIsSaved(false);
        setActionSuccessMsg('');
      }, 3000);
      return newLetter.id;
    } catch (err) {
      console.warn('Simpan riwayat tetap diteruskan secara lokal:', err);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      return '';
    }
  };

  // 2. Trigger Print Browser (Cetak Langsung)
  const handlePrint = async () => {
    setExportType('print');
    // Save history in background without blocking print dialog
    handleSaveToHistory().catch(() => {});
    
    setTimeout(() => {
      window.print();
      setExportType(null);
    }, 150);
  };

  // 3. Ekspor PDF
  const handleExportPdf = async () => {
    setIsExporting(true);
    setExportType('pdf');
    // Save history in background
    handleSaveToHistory().catch(() => {});

    try {
      await exportToPdf('letter-paper-render', getFilename(), paperSize);
      setActionSuccessMsg('✓ Berkas PDF berhasil diunduh!');
      setTimeout(() => {
        setActionSuccessMsg('');
      }, 3000);
    } catch (err: any) {
      alert('Gagal mengekspor PDF: ' + (err?.message || err));
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  // 4. Ekspor Word (DOCX)
  const handleExportDocx = async () => {
    setIsExporting(true);
    setExportType('word');
    // Save history in background
    handleSaveToHistory().catch(() => {});

    try {
      const finalBodyHtml = editableRef.current ? editableRef.current.innerHTML : customBodyHtml;
      await exportToDocx(profile, selectedTemplate.name, formValues, getFilename(), finalBodyHtml);
      setActionSuccessMsg('✓ Berkas Word (.docx) berhasil diunduh!');
      setTimeout(() => {
        setActionSuccessMsg('');
      }, 3000);
    } catch (err: any) {
      alert('Gagal mengekspor Word: ' + (err?.message || err));
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  // Display HTML
  const currentDisplayHtml = customBodyHtml || selectedTemplate.generatePreviewHtml(formValues, profile);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">
            {editLetterData ? 'Edit Dokumen Riwayat' : 'Buat Dokumen Surat Baru'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {editLetterData 
              ? `Mengedit dokumen: ${editLetterData.typeName} (Nomor: ${editLetterData.refNumber})`
              : 'Klik teks apa pun di lembar kertas sebelah kanan (Kop Surat, Isi Surat, dan Tanda Tangan) untuk mengedit secara langsung.'}
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

      {/* Success Notification Alert */}
      {actionSuccessMsg && (
        <div className="no-print p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Editor & Preview Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Input Form Controls (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6 no-print">
          
          {/* Settings Section (Template Selector & Paper Size) */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pengaturan Dokumen</h3>
            
            {/* Template Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Pilih Jenis Surat / Dokumen</label>
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
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Ukuran Kertas Pratinjau & Cetak</label>
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
                  Kertas A4 (210 x 297 mm)
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
                  Kertas F4 / Folio (215 x 330 mm)
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Variable Inputs Form */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Variabel Isian Form</h3>
              <button
                onClick={handleResetForm}
                className="text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Default</span>
              </button>
            </div>

            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {selectedTemplate.fields.map(field => (
                <div key={field.key} className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600">{field.label}</label>
                  
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formValues[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl transition-all font-sans"
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

          {/* Action Trigger Buttons (MENU AKSI PENERBITAN DOKUMEN) */}
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-blue-400 uppercase tracking-wider">Aksi Penerbitan Dokumen</h4>
              {isSaved && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Tersimpan!
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {/* 1. Cetak Langsung */}
              <button
                type="button"
                id="btn-cetak-langsung"
                onClick={handlePrint}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-600/30 cursor-pointer disabled:opacity-50"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Langsung</span>
              </button>

              {/* 2. Simpan Riwayat */}
              <button
                type="button"
                id="btn-simpan-riwayat"
                onClick={handleSaveToHistory}
                className={`flex items-center justify-center gap-2 py-3 border font-bold rounded-xl text-xs transition-all cursor-pointer active:scale-95 ${
                  isSaved 
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/30'
                    : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4 text-emerald-400" />}
                <span>{isSaved ? 'Tersimpan!' : 'Simpan Riwayat'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* 3. Ekspor PDF */}
              <button
                type="button"
                id="btn-ekspor-pdf"
                onClick={handleExportPdf}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold rounded-xl text-xs transition-all border border-slate-700 cursor-pointer active:scale-95"
              >
                <FileDown className="w-4 h-4 text-rose-400" />
                <span>{isExporting && exportType === 'pdf' ? 'Mengekspor...' : 'Ekspor PDF'}</span>
              </button>

              {/* 4. Ekspor Word */}
              <button
                type="button"
                id="btn-ekspor-word"
                onClick={handleExportDocx}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold rounded-xl text-xs transition-all border border-slate-700 cursor-pointer active:scale-95"
              >
                <FileDown className="w-4 h-4 text-blue-400" />
                <span>{isExporting && exportType === 'word' ? 'Mengekspor...' : 'Ekspor Word'}</span>
              </button>
            </div>

            <div className="flex gap-2 p-3 bg-slate-950/60 border border-slate-800 rounded-xl mt-3 text-[10px] text-slate-400">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p>
                Seluruh editan teks langsung di atas kertas (Kop Surat, Isi Surat & Tanda Tangan) akan ikut tersimpan ke riwayat dan terunduh persis sama saat Cetak, Ekspor PDF, maupun Ekspor Word.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Paper Canvas Preview & Inline Editor (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-100 p-4 border border-slate-200 rounded-2xl lg:sticky lg:top-20">
            
            {/* WYSIWYG Format Toolbar (no-print) */}
            <div className="bg-white border border-slate-200 rounded-xl p-2.5 mb-3 flex flex-wrap items-center justify-between gap-2 shadow-sm no-print">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => executeCommand('bold')}
                  title="Tebal (Bold)"
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors cursor-pointer"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('italic')}
                  title="Miring (Italic)"
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors cursor-pointer"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('underline')}
                  title="Garis Bawah (Underline)"
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors cursor-pointer"
                >
                  <Underline className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-5 bg-slate-200 mx-1"></div>
                <button
                  type="button"
                  onClick={() => executeCommand('justifyLeft')}
                  title="Rata Kiri"
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors cursor-pointer"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('justifyCenter')}
                  title="Rata Tengah"
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors cursor-pointer"
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('justifyRight')}
                  title="Rata Kanan"
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors cursor-pointer"
                >
                  <AlignRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('justifyFull')}
                  title="Rata Kanan-Kiri (Justify)"
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors cursor-pointer"
                >
                  <AlignJustify className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* HTML Source Editor Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setRawHtmlInput(editableRef.current ? editableRef.current.innerHTML : currentDisplayHtml);
                    setIsHtmlModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="Edit Kode Sumber HTML Surat"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Kode HTML</span>
                </button>

                {/* Edit mode toggle button */}
                <button
                  type="button"
                  onClick={() => setIsInlineEditing(!isInlineEditing)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                    isInlineEditing 
                      ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' 
                      : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                  }`}
                  title="Klik untuk mengaktifkan/menonaktifkan mode ketik langsung"
                >
                  <Edit3 className="w-3 h-3 text-blue-600" />
                  <span>{isInlineEditing ? 'Mode Ketik Langsung Aktif' : 'Mode Pratinjau Terkunci'}</span>
                </button>

              </div>
            </div>

            {/* Hint Notice */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2 px-1 no-print">
              <span className="flex items-center gap-1 font-medium">
                <Eye className="w-3.5 h-3.5 text-blue-500" />
                Ketik langsung di mana saja pada lembar kertas di bawah (Kop Surat, Isi, & TTD) untuk mengedit teks secara bebas.
              </span>
              <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded uppercase">
                {paperSize.toUpperCase()}
              </span>
            </div>

            {/* Simulated Paper Wrapper */}
            <div className="w-full bg-slate-300 border border-slate-300 rounded-xl overflow-x-auto shadow-inner p-4 flex justify-center">
              
              {/* Outer paper container that will be exported to canvas/pdf/print */}
              <div 
                id="letter-paper-render"
                className={`paper-preview ${
                  paperSize === 'a4' ? 'paper-a4' : 'paper-f4'
                } print:shadow-none print:border-none font-serif text-black`}
              >
                {/* 1. Kop Surat Resmi SMKN 2 Tikep (Bisa Diedit Langsung di Kertas) */}
                <LetterheadPreview 
                  profile={profile} 
                  isEditable={isInlineEditing}
                  onKopChange={handleKopChange}
                  onLogoChange={handleLogoChange}
                />

                {/* 2. Custom Letter Body (Inline WYSIWYG Content Editable) */}
                <div 
                  ref={editableRef}
                  contentEditable={isInlineEditing}
                  suppressContentEditableWarning={true}
                  onInput={handleContentInput}
                  onBlur={handleContentInput}
                  className={`editable-box ${isInlineEditing ? 'editable-active' : ''}`}
                  dangerouslySetInnerHTML={{ __html: currentDisplayHtml }}
                />

                {/* 3. Signature Area (Formal Titimangsa and Principal info - Directly Editable on Paper) */}
                {selectedTemplate.id !== 'surat-pernyataan' && selectedTemplate.id !== 'disposisi-surat' && (
                  <div className="mt-8 flex justify-end text-black font-serif text-[12px] avoid-break">
                    <div className="w-[220px] text-center">
                      <p 
                        contentEditable={isInlineEditing}
                        suppressContentEditableWarning={true}
                        className="outline-none focus:bg-blue-50/50"
                      >
                        Kepala Sekolah,
                      </p>
                      
                      {/* Space for signing */}
                      <div className="h-[60px]"></div>
                      
                      <p 
                        contentEditable={isInlineEditing}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleKopChange('principalName', e.currentTarget.innerText.trim())}
                        className="font-bold underline leading-snug outline-none focus:bg-blue-50/50"
                      >
                        {profile.principalName || 'Ali Djumati.S.Pd.,M.Si'}
                      </p>
                      <p 
                        contentEditable={isInlineEditing}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleKopChange('principalNip', e.currentTarget.innerText.replace(/^NIP\.\s*/i, '').trim())}
                        className="text-[11px] leading-tight outline-none focus:bg-blue-50/50"
                      >
                        NIP. {profile.principalNip || '1977601062003121005'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tanda Tangan Disposisi */}
                {selectedTemplate.id === 'disposisi-surat' && (
                  <div className="mt-6 flex justify-between items-start text-black font-serif text-[12px] avoid-break">
                    <div className="w-[200px] text-center">
                      <p 
                        contentEditable={isInlineEditing}
                        suppressContentEditableWarning={true}
                        className="outline-none focus:bg-blue-50/50"
                      >
                        Mengetahui / Menerima,
                      </p>
                      <div className="h-[60px]"></div>
                      <p 
                        contentEditable={isInlineEditing}
                        suppressContentEditableWarning={true}
                        className="font-bold underline outline-none focus:bg-blue-50/50"
                      >
                        ( ............................................ )
                      </p>
                    </div>

                    <div className="w-[220px] text-center">
                      <p 
                        contentEditable={isInlineEditing}
                        suppressContentEditableWarning={true}
                        className="outline-none focus:bg-blue-50/50"
                      >
                        Tidore, {formatDateIndo(formValues.tanggal_diterima || new Date().toISOString())}
                      </p>
                      <p 
                        contentEditable={isInlineEditing}
                        suppressContentEditableWarning={true}
                        className="font-semibold outline-none focus:bg-blue-50/50"
                      >
                        Kepala Sekolah,
                      </p>
                      <div className="h-[60px]"></div>
                      <p 
                        contentEditable={isInlineEditing}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleKopChange('principalName', e.currentTarget.innerText.trim())}
                        className="font-bold underline outline-none focus:bg-blue-50/50"
                      >
                        {profile.principalName || 'Ali Djumati.S.Pd.,M.Si'}
                      </p>
                      <p 
                        contentEditable={isInlineEditing}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleKopChange('principalNip', e.currentTarget.innerText.replace(/^NIP\.\s*/i, '').trim())}
                        className="text-[11px] outline-none focus:bg-blue-50/50"
                      >
                        NIP. {profile.principalNip || '1977601062003121005'}
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ================= RAW HTML CODE EDITOR MODAL ================= */}
      {isHtmlModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">Editor Sumber HTML Surat</h3>
                <p className="text-xs text-slate-500">Anda dapat mengubah format tabel, font, atau menambahkan teks kustom secara langsung.</p>
              </div>
              <button
                onClick={() => setIsHtmlModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 min-h-[300px]">
              <textarea
                value={rawHtmlInput}
                onChange={(e) => setRawHtmlInput(e.target.value)}
                className="w-full h-full min-h-[300px] font-mono text-xs p-4 bg-slate-900 text-slate-100 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsHtmlModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomBodyHtml(rawHtmlInput);
                  if (editableRef.current) {
                    editableRef.current.innerHTML = rawHtmlInput;
                  }
                  setIsHtmlModalOpen(false);
                }}
                className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-md cursor-pointer"
              >
                Terapkan Perubahan HTML
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
