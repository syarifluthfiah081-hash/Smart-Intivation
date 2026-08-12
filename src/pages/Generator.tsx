import React, { useState, useEffect } from 'react';
import { db, seedDefaultSettings, type SchoolSettings } from '../services/db';
import { LETTER_SCHEMAS } from '../templates';
import { LetterPreview } from '../components/LetterPreview';
import { exportToDocx } from '../services/docxGenerator';
import { 
  Printer, 
  Save, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  Trash2
} from 'lucide-react';

interface GeneratorProps {
  selectedType: 'skl' | 'undangan' | 'tugas' | 'pengantar' | 'rekomendasi' | 'pindahan';
  setSelectedType: (type: any) => void;
  editLetterData: any;
  setEditLetterData: (data: any) => void;
}

export const Generator: React.FC<GeneratorProps> = ({
  selectedType,
  setSelectedType,
  editLetterData,
  setEditLetterData,
}) => {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [paperSize, setPaperSize] = useState<'a4' | 'f4'>('a4');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const schema = LETTER_SCHEMAS[selectedType];

  useEffect(() => {
    async function loadSchoolData() {
      try {
        const schoolData = await seedDefaultSettings();
        setSettings(schoolData);
        
        // Load default values or edit values
        if (editLetterData && editLetterData.type === selectedType) {
          setFormData(editLetterData.formData);
        } else {
          // Initialize defaults from schema
          const defaults: Record<string, any> = {};
          schema.fields.forEach((field) => {
            if (field.defaultValue !== undefined) {
              defaults[field.key] = field.defaultValue;
            } else if (field.type === 'table') {
              defaults[field.key] = field.defaultValue || [
                { c0: '1', c1: '', c2: '', c3: '' }
              ];
            } else {
              defaults[field.key] = '';
            }
          });
          setFormData(defaults);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadSchoolData();
  }, [selectedType, editLetterData]);

  // Handle standard input changes
  const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle table type changes for pengantar
  const handleTableRowChange = (key: string, index: number, col: string, value: string) => {
    const tableList = [...(formData[key] || [])];
    tableList[index] = {
      ...tableList[index],
      [col]: value
    };
    handleInputChange(key, tableList);
  };

  const addTableRow = (key: string) => {
    const tableList = [...(formData[key] || [])];
    tableList.push({
      c0: String(tableList.length + 1),
      c1: '',
      c2: '',
      c3: ''
    });
    handleInputChange(key, tableList);
  };

  const deleteTableRow = (key: string, index: number) => {
    let tableList = [...(formData[key] || [])];
    tableList.splice(index, 1);
    // Re-index
    tableList = tableList.map((item, idx) => ({
      ...item,
      c0: String(idx + 1)
    }));
    handleInputChange(key, tableList);
  };

  // Reset current form to schema defaults
  const handleResetForm = () => {
    const defaults: Record<string, any> = {};
    schema.fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        defaults[field.key] = field.defaultValue;
      } else if (field.type === 'table') {
        defaults[field.key] = [
          { c0: '1', c1: '', c2: '', c3: '' }
        ];
      } else {
        defaults[field.key] = '';
      }
    });
    setFormData(defaults);
    setEditLetterData(null);
    setAlert({ type: 'warning', message: 'Formulir berhasil dikosongkan.' });
    setTimeout(() => setAlert(null), 3000);
  };

  // Form validations before saving/printing
  const validateForm = (): boolean => {
    // Basic checks
    if (!formData.refNumber) {
      setAlert({ type: 'error', message: 'Nomor Surat wajib diisi!' });
      return false;
    }
    
    // Check specific fields based on types
    if (selectedType === 'skl' && !formData.studentName) {
      setAlert({ type: 'error', message: 'Nama Lengkap Siswa wajib diisi!' });
      return false;
    }
    if (selectedType === 'tugas' && !formData.staffName) {
      setAlert({ type: 'error', message: 'Nama Guru/Staf penerima tugas wajib diisi!' });
      return false;
    }
    if (selectedType === 'undangan' && !formData.eventDayDate) {
      setAlert({ type: 'error', message: 'Hari / Tanggal Acara wajib diisi!' });
      return false;
    }

    return true;
  };

  // Save Generated Letter to Database History
  const handleSaveToArchive = async () => {
    if (!validateForm()) return;

    // Get recipient detail
    let recipientName = '';
    let recipientDetail = '';
    let title = schema.title;

    if (selectedType === 'skl') {
      recipientName = formData.studentName;
      recipientDetail = `NISN: ${formData.nisn || '-'}`;
    } else if (selectedType === 'tugas') {
      recipientName = formData.staffName;
      recipientDetail = `NIP: ${formData.staffNip || '-'}`;
    } else if (selectedType === 'undangan') {
      recipientName = formData.targetRecipient;
      recipientDetail = formData.subject;
    } else if (selectedType === 'pengantar') {
      recipientName = formData.recipientName;
      recipientDetail = 'Pengiriman Dokumen';
    } else if (selectedType === 'rekomendasi') {
      recipientName = formData.recommendedName;
      recipientDetail = formData.recommendationPurpose;
    } else if (selectedType === 'pindahan') {
      recipientName = formData.studentName;
      recipientDetail = `Dari: ${formData.originSchool || '-'}`;
    }

    const payload = {
      title,
      type: selectedType,
      refNumber: formData.refNumber,
      createdAt: new Date().toISOString().split('T')[0],
      recipientName,
      recipientDetail,
      formData: {
        ...formData,
        paperSize,
        fontFamily
      }
    };

    try {
      if (editLetterData && editLetterData.id) {
        await db.letters.put({ ...payload, id: editLetterData.id });
        setAlert({ type: 'success', message: 'Surat berhasil diperbarui di Arsip!' });
      } else {
        await db.letters.add(payload);
        setAlert({ type: 'success', message: 'Surat berhasil disimpan ke Arsip!' });
      }
      setTimeout(() => setAlert(null), 4000);
    } catch (e) {
      console.error(e);
      setAlert({ type: 'error', message: 'Gagal mengarsipkan surat.' });
    }
  };

  // Launch Native Browser Print
  const handlePrint = () => {
    if (!validateForm()) return;
    window.print();
  };

  // Export to Word document
  const handleWordExport = async () => {
    if (!validateForm() || !settings) return;
    try {
      await exportToDocx(selectedType, formData, settings);
      setAlert({ type: 'success', message: 'Dokumen Word berhasil dibuat dan diunduh!' });
      setTimeout(() => setAlert(null), 3000);
    } catch (e) {
      console.error('Word export error:', e);
      setAlert({ type: 'error', message: 'Gagal mengekspor berkas Word.' });
    }
  };

  // Group fields by category
  const categories = Array.from(new Set(schema.fields.map(f => f.category)));

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full no-print">
      {/* 1. LEFT PANE: DYNAMIC EDITOR FORM */}
      <div className="w-full lg:w-[45%] bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        {/* Editor Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-slate-50">
          <div className="flex items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as any);
                setEditLetterData(null); // Clear editing context when type changes
              }}
              className="font-bold text-slate-800 text-sm py-1.5 px-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all cursor-pointer"
            >
              {Object.values(LETTER_SCHEMAS).map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleResetForm}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 font-bold"
            title="Reset formulir ke bawaan"
          >
            <RefreshCw size={13} />
            Kosongkan
          </button>
        </div>

        {/* Editor Inputs */}
        <div className="flex-grow overflow-y-auto p-5 space-y-6">
          {alert && (
            <div 
              className={`p-3 text-xs font-semibold rounded-xl border flex items-center gap-2 ${
                alert.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                alert.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {alert.type === 'success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
              <span>{alert.message}</span>
            </div>
          )}

          {categories.map((cat) => (
            <div key={cat} className="space-y-4">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                {cat}
              </h3>
              
              <div className="space-y-3">
                {schema.fields.filter(f => f.category === cat).map((field) => {
                  const val = formData[field.key] !== undefined ? formData[field.key] : '';

                  if (field.type === 'textarea') {
                    return (
                      <div key={field.key} className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">{field.label}</label>
                        <textarea
                          rows={3}
                          value={val}
                          placeholder={field.placeholder}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                        />
                      </div>
                    );
                  }

                  if (field.type === 'select') {
                    return (
                      <div key={field.key} className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">{field.label}</label>
                        <select
                          value={val}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all font-medium text-slate-700"
                        >
                          {field.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  if (field.type === 'table') {
                    const rows = formData[field.key] || [];
                    return (
                      <div key={field.key} className="space-y-2">
                        <div className="flex items-center justify-between pb-1">
                          <label className="block text-xs font-bold text-slate-700">{field.label}</label>
                          <button
                            type="button"
                            onClick={() => addTableRow(field.key)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700"
                          >
                            <Plus size={12} /> Tambah Berkas
                          </button>
                        </div>

                        <div className="space-y-2 border border-slate-100 p-2.5 rounded-xl bg-slate-50">
                          {rows.map((row: any, idx: number) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <span className="text-xs font-bold text-slate-400 w-5 text-center">
                                {idx + 1}
                              </span>
                              <input
                                type="text"
                                placeholder="Nama/Jenis Dokumen"
                                value={row.c1 || ''}
                                onChange={(e) => handleTableRowChange(field.key, idx, 'c1', e.target.value)}
                                className="flex-1 min-w-0 px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                              />
                              <input
                                type="text"
                                placeholder="Jumlah (e.g. 1 Rangkap)"
                                value={row.c2 || ''}
                                onChange={(e) => handleTableRowChange(field.key, idx, 'c2', e.target.value)}
                                className="w-24 px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                              />
                              <input
                                type="text"
                                placeholder="Keterangan"
                                value={row.c3 || ''}
                                onChange={(e) => handleTableRowChange(field.key, idx, 'c3', e.target.value)}
                                className="w-24 px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                              />
                              <button
                                type="button"
                                onClick={() => deleteTableRow(field.key, idx)}
                                disabled={rows.length <= 1}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:pointer-events-none rounded"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // Default text / date input
                  return (
                    <div key={field.key} className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">{field.label}</label>
                      <input
                        type={field.type}
                        value={val}
                        placeholder={field.placeholder}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Editor Bottom Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <button
            onClick={handleSaveToArchive}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Save size={14} />
            {editLetterData ? 'Perbarui Arsip' : 'Simpan ke Arsip'}
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={handleWordExport}
              className="flex items-center gap-1 px-3 py-2.5 bg-slate-800 hover:bg-slate-900 text-slate-200 font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              <Download size={14} />
              Word
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-4 py-2.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-extrabold border border-slate-200 hover:border-indigo-200 rounded-xl text-xs transition-all cursor-pointer"
            >
              <Printer size={14} />
              Cetak / PDF
            </button>
          </div>
        </div>
      </div>

      {/* 2. RIGHT PANE: REAL-TIME INTERACTIVE PRINT PREVIEW */}
      <div className="w-full lg:w-[55%] flex flex-col h-[calc(100vh-64px)] bg-slate-200/50">
        {/* Preview Header controls */}
        <div className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 flex-shrink-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Live Preview
          </span>

          <div className="flex items-center gap-3">
            {/* Paper Size Control */}
            <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              <button
                onClick={() => setPaperSize('a4')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                  paperSize === 'a4' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                A4
              </button>
              <button
                onClick={() => setPaperSize('f4')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                  paperSize === 'f4' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                F4
              </button>
            </div>

            {/* Font Control */}
            <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              <button
                onClick={() => setFontFamily('serif')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                  fontFamily === 'serif' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Serif
              </button>
              <button
                onClick={() => setFontFamily('sans')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                  fontFamily === 'sans' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sans
              </button>
            </div>
          </div>
        </div>

        {/* Paper Sheet Preview Area */}
        <div className="flex-grow overflow-auto p-6 flex justify-center items-start">
          <div className="transform scale-[0.65] sm:scale-[0.8] md:scale-[0.9] lg:scale-100 origin-top shadow-2xl transition-transform">
            <LetterPreview
              type={selectedType}
              formData={formData}
              settings={settings}
              paperSize={paperSize}
              fontFamily={fontFamily}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
