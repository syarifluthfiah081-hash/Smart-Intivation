import React, { useState, useEffect, useRef } from 'react';
import { getSchoolProfile, addLetterToHistory, saveLetterHistory, getLetterHistory } from '../services/storage';
import type { GeneratedLetter } from '../services/storage';
import type { SchoolProfile } from '../components/LetterheadPreview';
import { LetterheadPreview } from '../components/LetterheadPreview';
import { letterTemplates, formatDateIndo } from '../templates/letterTemplates';
import type { LetterTemplate } from '../templates/letterTemplates';
import { exportToPdf } from '../services/pdfGenerator';
import { exportToDocx } from '../services/docxGenerator';
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
  Code
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
  const [profile, setProfile] = useState<SchoolProfile | null>(null);
  
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
  const [isSaved, setIsSaved] = useState(false);

  const editableRef = useRef<HTMLDivElement>(null);

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

  // 1. Simpan Ke Riwayat Surat
  const handleSaveToHistory = async (): Promise<string> => {
    if (!profile) return '';

    // Get current HTML from editable canvas
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
          setTimeout(() => setIsSaved(false), 3000);
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
              : 'Pilih tipe surat, isi formulir di kiri, atau klik dan edit langsung teks apa pun di lembar kertas sebelah kanan.'}
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

            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
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
                {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
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
                Seluruh editan teks langsung di atas kertas akan ikut terunduh saat Ekspor PDF & Cetak.
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
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('italic')}
                  title="Miring (Italic)"
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('underline')}
                  title="Garis Bawah (Underline)"
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors"
                >
                  <Underline className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-5 bg-slate-200 mx-1"></div>
                <button
                  type="button"
                  onClick={() => executeCommand('justifyLeft')}
                  title="Rata Kiri"
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('justifyCenter')}
                  title="Rata Tengah"
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors"
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('justifyRight')}
                  title="Rata Kanan"
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors"
                >
                  <AlignRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('justifyFull')}
                  title="Rata Kanan-Kiri (Justify)"
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors"
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
                  <span>{isInlineEditing ? 'Mode Edit Bebas Aktif' : 'Mode Pratinjau Terkunci'}</span>
                </button>

              </div>
            </div>

            {/* Hint Notice */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2 px-1 no-print">
              <span className="flex items-center gap-1 font-medium">
                <Eye className="w-3.5 h-3.5 text-blue-500" />
                Klik bagian teks mana saja di dalam kertas untuk mengedit isi surat sesuka Anda sebelum dicetak.
              </span>
              <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded uppercase">
                {paperSize.toUpperCase()}
              </span>
            </div>

            {/* Simulated Paper Wrapper */}
            <div className="w-full bg-slate-300 border border-slate-300 rounded-xl overflow-x-auto shadow-inner p-4 flex justify-center">
              
              {/* Outer paper container that will be exported to canvas/pdf */}
              <div 
                id="letter-paper-render"
                className={`paper-preview ${
                  paperSize === 'a4' ? 'paper-a4' : 'paper-f4'
                } print:shadow-none print:border-none`}
              >
                {/* 1. Kop Surat Resmi SMKN 2 Tikep (Dual Logo Kiri & Kanan) */}
                <LetterheadPreview profile={profile} />

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

                {/* 3. Signature Area (Formal Titimangsa and Principal info) */}
                {selectedTemplate.id !== 'surat-pernyataan' && selectedTemplate.id !== 'disposisi-surat' && (
                  <div className="mt-8 flex justify-end text-black font-serif text-[12px] avoid-break">
                    <div className="w-[220px] text-center">
                      <p>Kepala Sekolah,</p>
                      {/* Space for signing */}
                      <div className="h-[75px] print:h-[55px] no-print flex items-center justify-center text-slate-300 text-[10px] border border-dashed border-slate-200 rounded my-2">
                        Ruang Tanda Tangan & Stempel
                      </div>
                      {/* Spacer for printable signatures */}
                      <div className="hidden print:block h-[55px]"></div>
                      
                      <p className="font-bold underline leading-snug">{profile.principalName}</p>
                      <p className="text-[11px] leading-tight">NIP. {profile.principalNip}</p>
                    </div>
                  </div>
                )}

                {/* Tanda Tangan Disposisi */}
                {selectedTemplate.id === 'disposisi-surat' && (
                  <div className="mt-6 flex justify-between items-start text-black font-serif text-[12px] avoid-break">
                    <div className="w-[200px] text-center">
                      <p>Mengetahui / Menerima,</p>
                      <div className="h-[60px] no-print flex items-center justify-center text-slate-300 text-[10px] border border-dashed border-slate-200 rounded my-2">
                        Paraf Pejabat Disposisi
                      </div>
                      <div className="hidden print:block h-[50px]"></div>
                      <p className="font-bold underline">( ............................................ )</p>
                    </div>

                    <div className="w-[220px] text-center">
                      <p>Tidore, {formatDateIndo(formValues.tanggal_diterima || new Date().toISOString())}</p>
                      <p className="font-semibold">Kepala Sekolah,</p>
                      <div className="h-[60px] no-print flex items-center justify-center text-slate-300 text-[10px] border border-dashed border-slate-200 rounded my-2">
                        Tanda Tangan & Stempel
                      </div>
                      <div className="hidden print:block h-[50px]"></div>
                      <p className="font-bold underline">{profile.principalName}</p>
                      <p className="text-[11px]">NIP. {profile.principalNip}</p>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Raw HTML Code Editor Modal */}
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
                className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50"
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
                className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-md"
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
