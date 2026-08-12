
export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'textarea' | 'number' | 'table';
  placeholder?: string;
  defaultValue?: any;
  options?: { value: string; label: string }[]; // For select type
  category: string; // Grouping fields in form UI
  description?: string;
  tableHeaders?: string[]; // For table type
}

export interface LetterSchema {
  id: 'skl' | 'undangan' | 'tugas' | 'pengantar' | 'rekomendasi' | 'pindahan';
  title: string;
  description: string;
  defaultRefPattern: string;
  fields: FieldConfig[];
}

export const LETTER_SCHEMAS: Record<string, LetterSchema> = {
  skl: {
    id: 'skl',
    title: 'Surat Keterangan Lulus (SKL)',
    description: 'Surat keterangan kelulusan resmi untuk siswa tingkat akhir.',
    defaultRefPattern: '421.3/{NUM}/SMAN1-BDG/2026',
    fields: [
      { key: 'refNumber', label: 'Nomor Surat', type: 'text', defaultValue: '421.3/089/SMAN1-BDG/2026', category: 'Informasi Surat' },
      { key: 'letterDate', label: 'Tanggal Surat', type: 'date', defaultValue: new Date().toISOString().split('T')[0], category: 'Informasi Surat' },
      
      { key: 'studentName', label: 'Nama Lengkap Siswa', type: 'text', placeholder: 'Budi Santoso', category: 'Data Siswa' },
      { key: 'nis', label: 'Nomor Induk Siswa (NIS)', type: 'text', placeholder: '222310123', category: 'Data Siswa' },
      { key: 'nisn', label: 'Nomor Induk Siswa Nasional (NISN)', type: 'text', placeholder: '0081234567', category: 'Data Siswa' },
      { key: 'birthPlace', label: 'Tempat Lahir', type: 'text', placeholder: 'Bandung', category: 'Data Siswa' },
      { key: 'birthDate', label: 'Tanggal Lahir', type: 'date', defaultValue: '2008-01-01', category: 'Data Siswa' },
      { key: 'parentName', label: 'Nama Orang Tua / Wali', type: 'text', placeholder: 'Joko Santoso', category: 'Data Siswa' },
      { 
        key: 'program', 
        label: 'Program Keahlian / Peminatan', 
        type: 'select', 
        defaultValue: 'MIPA',
        options: [
          { value: 'MIPA (Matematika dan Ilmu Pengetahuan Alam)', label: 'MIPA' },
          { value: 'IPS (Ilmu Pengetahuan Sosial)', label: 'IPS' },
          { value: 'Bahasa dan Budaya', label: 'Bahasa' },
          { value: 'Teknik Komputer dan Jaringan (TKJ)', label: 'TKJ (SMK)' },
          { value: 'Akuntansi', label: 'Akuntansi (SMK)' }
        ],
        category: 'Data Siswa' 
      },
      
      { key: 'graduationYear', label: 'Tahun Pelajaran', type: 'text', defaultValue: '2025/2026', category: 'Keterangan Kelulusan' },
      { 
        key: 'status', 
        label: 'Status Kelulusan', 
        type: 'select', 
        defaultValue: 'LULUS',
        options: [
          { value: 'LULUS', label: 'Lulus' },
          { value: 'TIDAK LULUS', label: 'Tidak Lulus' }
        ],
        category: 'Keterangan Kelulusan' 
      },
      { key: 'additionalNotes', label: 'Catatan Tambahan', type: 'textarea', placeholder: 'Surat keterangan ini berlaku sementara sampai diterbitkannya ijazah asli.', category: 'Keterangan Kelulusan' }
    ]
  },
  undangan: {
    id: 'undangan',
    title: 'Undangan Orang Tua / Wali',
    description: 'Surat undangan pertemuan resmi bagi orang tua/wali murid.',
    defaultRefPattern: '005/{NUM}/SMAN1-BDG/2026',
    fields: [
      { key: 'refNumber', label: 'Nomor Surat', type: 'text', defaultValue: '005/045/SMAN1-BDG/2026', category: 'Informasi Surat' },
      { key: 'letterDate', label: 'Tanggal Surat', type: 'date', defaultValue: new Date().toISOString().split('T')[0], category: 'Informasi Surat' },
      { key: 'attachments', label: 'Lampiran', type: 'text', defaultValue: '-', category: 'Informasi Surat' },
      { key: 'subject', label: 'Perihal / Hal', type: 'text', defaultValue: 'Undangan Rapat Pleno Rencana Kerja Sekolah', category: 'Informasi Surat' },
      
      { key: 'targetRecipient', label: 'Penerima Undangan', type: 'text', defaultValue: 'Orang Tua / Wali Murid Kelas X, XI, dan XII', category: 'Penerima' },
      
      { key: 'openingNotes', label: 'Salam Pembuka / Pembuka Surat', type: 'textarea', defaultValue: 'Sehubungan dengan agenda tahunan program sekolah serta perumusan rencana kegiatan siswa tahun pelajaran baru, kami mengharap kehadiran Bapak/Ibu Wali Murid pada pertemuan yang akan diselenggarakan pada:', category: 'Isi Undangan' },
      { key: 'eventDayDate', label: 'Hari / Tanggal Acara', type: 'text', placeholder: 'Kamis, 20 Agustus 2026', category: 'Isi Undangan' },
      { key: 'eventTime', label: 'Waktu Acara', type: 'text', placeholder: '08.30 WIB s.d Selesai', category: 'Isi Undangan' },
      { key: 'eventLocation', label: 'Tempat Pertemuan', type: 'text', placeholder: 'Aula Serbaguna SMA Negeri 1 Kota Bandung', category: 'Isi Undangan' },
      { key: 'eventAgenda', label: 'Agenda Rapat', type: 'textarea', defaultValue: '1. Pemaparan RKAS (Rencana Kegiatan Anggaran Sekolah)\n2. Koordinasi Komite Sekolah tentang Iuran Penunjang\n3. Tanya Jawab & Penutup', category: 'Isi Undangan' },
      
      { key: 'closingNotes', label: 'Salam Penutup / Penutup Surat', type: 'textarea', defaultValue: 'Mengingat pentingnya acara ini guna kemajuan pendidikan putra/putri kita, kehadiran Bapak/Ibu tepat pada waktunya sangat kami harapkan. Atas perhatian dan kerja sama yang baik, kami ucapkan terima kasih.', category: 'Isi Undangan' }
    ]
  },
  tugas: {
    id: 'tugas',
    title: 'Surat Tugas Guru / Staf',
    description: 'Surat penugasan resmi untuk guru atau staf mengikuti kegiatan/dinas.',
    defaultRefPattern: '094/{NUM}/SMAN1-BDG/2026',
    fields: [
      { key: 'refNumber', label: 'Nomor Surat', type: 'text', defaultValue: '094/112/SMAN1-BDG/2026', category: 'Informasi Surat' },
      { key: 'letterDate', label: 'Tanggal Surat', type: 'date', defaultValue: new Date().toISOString().split('T')[0], category: 'Informasi Surat' },
      
      { key: 'foundation', label: 'Dasar Surat Tugas', type: 'textarea', defaultValue: 'Surat Keputusan Kepala Dinas Pendidikan Provinsi Jawa Barat Nomor: 421/7212-Set.Disdik perihal pelaksanaan Sosialisasi Kurikulum Merdeka Tingkat Menengah Atas.', category: 'Dasar Hukum' },
      
      { key: 'staffName', label: 'Nama Staf / Guru', type: 'text', placeholder: 'Sri Wahyuni, S.Pd.', category: 'Penerima Tugas' },
      { key: 'staffNip', label: 'NIP / NUPTK', type: 'text', placeholder: '19850212 201001 2 004', category: 'Penerima Tugas' },
      { key: 'staffRank', label: 'Pangkat / Golongan', type: 'text', placeholder: 'Penata, III/c', category: 'Penerima Tugas' },
      { key: 'staffRole', label: 'Jabatan Utama', type: 'text', placeholder: 'Guru Madya / Wali Kelas XI-A', category: 'Penerima Tugas' },
      
      { key: 'taskPurpose', label: 'Tujuan Penugasan', type: 'textarea', defaultValue: 'Mengikuti Bimbingan Teknis Implementasi Asesmen Pembelajaran Nasional Kurikulum Merdeka.', category: 'Detail Tugas' },
      { key: 'taskDate', label: 'Waktu Tugas', type: 'text', placeholder: 'Senin s.d. Rabu, 24 - 26 Agustus 2026', category: 'Detail Tugas' },
      { key: 'taskLocation', label: 'Tempat Penugasan', type: 'text', placeholder: 'Hotel Grand Asrilia Bandung, Jl. Pelajar Pejuang 45 No. 123', category: 'Detail Tugas' },
      
      { key: 'closingNotes', label: 'Penutup Surat', type: 'textarea', defaultValue: 'Demikian surat tugas ini dibuat untuk dilaksanakan dengan penuh rasa tanggung jawab, dan melaporkan hasilnya setelah selesai melaksanakan tugas.', category: 'Detail Tugas' }
    ]
  },
  pengantar: {
    id: 'pengantar',
    title: 'Surat Pengantar Umum',
    description: 'Surat pengantar pengiriman dokumen atau berkas resmi sekolah.',
    defaultRefPattern: '045/{NUM}/SMAN1-BDG/2026',
    fields: [
      { key: 'refNumber', label: 'Nomor Surat', type: 'text', defaultValue: '045/056/SMAN1-BDG/2026', category: 'Informasi Surat' },
      { key: 'letterDate', label: 'Tanggal Surat', type: 'date', defaultValue: new Date().toISOString().split('T')[0], category: 'Informasi Surat' },
      
      { key: 'recipientName', label: 'Nama Penerima', type: 'text', placeholder: 'Kepala Dinas Pendidikan Kota Bandung', category: 'Tujuan' },
      { key: 'recipientAddr', label: 'Alamat Penerima', type: 'textarea', placeholder: 'Jalan Siliwangi No. 12\nBandung', category: 'Tujuan' },
      
      { key: 'introduction', label: 'Pengantar Kata', type: 'textarea', defaultValue: 'Bersama ini kami kirimkan berkas/dokumen sekolah sebagaimana rincian berikut di bawah ini:', category: 'Isi Pengantar' },
      
      { 
        key: 'tableData', 
        label: 'Daftar Dokumen yang Dikirim', 
        type: 'table', 
        tableHeaders: ['No', 'Jenis Berkas/Dokumen', 'Jumlah', 'Keterangan'],
        defaultValue: [
          { c0: '1', c1: 'Laporan Pertanggungjawaban BOS Tahap I', c2: '1 Rangkap', c3: 'Asli & Lampiran Lengkap' },
          { c2: '2 Rangkap', c3: 'Fotokopi dilegalisir' }
        ],
        category: 'Rincian Berkas' 
      },
      
      { key: 'closingNotes', label: 'Penutup Surat', type: 'textarea', defaultValue: 'Demikian surat pengantar ini kami sampaikan, atas perhatian dan diterimanya dokumen tersebut, kami ucapkan terima kasih.', category: 'Isi Pengantar' }
    ]
  },
  rekomendasi: {
    id: 'rekomendasi',
    title: 'Surat Rekomendasi',
    description: 'Surat rekomendasi untuk beasiswa, prestasi, atau keperluan umum siswa/guru.',
    defaultRefPattern: '421.4/{NUM}/SMAN1-BDG/2026',
    fields: [
      { key: 'refNumber', label: 'Nomor Surat', type: 'text', defaultValue: '421.4/102/SMAN1-BDG/2026', category: 'Informasi Surat' },
      { key: 'letterDate', label: 'Tanggal Surat', type: 'date', defaultValue: new Date().toISOString().split('T')[0], category: 'Informasi Surat' },
      
      { key: 'recommendedName', label: 'Nama yang Direkomendasikan', type: 'text', placeholder: 'Diana Putri', category: 'Rekomendasi Utama' },
      { key: 'recommendedIdentity', label: 'Nomor Identitas (NISN / NIP)', type: 'text', placeholder: '0085432109', category: 'Rekomendasi Utama' },
      { key: 'recommendedPosition', label: 'Jabatan / Kelas', type: 'text', placeholder: 'Siswa Kelas XII MIPA 3', category: 'Rekomendasi Utama' },
      { key: 'recommendedAddress', label: 'Alamat Rumah', type: 'textarea', placeholder: 'Jl. Merdeka No. 45, Coblong, Bandung', category: 'Rekomendasi Utama' },
      
      { key: 'recommendationPurpose', label: 'Tujuan Beasiswa/Keperluan', type: 'text', defaultValue: 'Program Beasiswa Jabar Future Leaders Scholarship (JFLS) Tahun 2026', category: 'Rincian Rekomendasi' },
      { key: 'recommendationContent', label: 'Isi Alasan Rekomendasi', type: 'textarea', defaultValue: 'Siswa tersebut di atas adalah siswa berprestasi di sekolah kami dengan catatan akademik yang konsisten di peringkat 3 besar kelas. Selain itu, yang bersangkutan aktif berorganisasi sebagai Sekretaris OSIS dan memiliki kepribadian serta budi pekerti yang sangat baik.', category: 'Rincian Rekomendasi' },
      
      { key: 'closingNotes', label: 'Penutup Surat', type: 'textarea', defaultValue: 'Demikian surat rekomendasi ini dibuat dengan sebenarnya untuk dapat dipergunakan secara semestinya dalam memenuhi administrasi pendaftaran beasiswa.', category: 'Rincian Rekomendasi' }
    ]
  },
  pindahan: {
    id: 'pindahan',
    title: 'Surat Keterangan Diterima Pindahan',
    description: 'Surat resmi menyatakan kesiapan menerima siswa pindahan dari sekolah lain.',
    defaultRefPattern: '422/{NUM}/SMAN1-BDG/2026',
    fields: [
      { key: 'refNumber', label: 'Nomor Surat', type: 'text', defaultValue: '422/076/SMAN1-BDG/2026', category: 'Informasi Surat' },
      { key: 'letterDate', label: 'Tanggal Surat', type: 'date', defaultValue: new Date().toISOString().split('T')[0], category: 'Informasi Surat' },
      
      { key: 'requestDetails', label: 'Rujukan Permohonan', type: 'textarea', defaultValue: 'Berdasarkan surat permohonan kepindahan orang tua/wali murid tertanggal 4 Agustus 2026 perihal permohonan mutasi masuk siswa pindahan ke SMA Negeri 1 Kota Bandung.', category: 'Rujukan' },
      
      { key: 'studentName', label: 'Nama Lengkap Siswa', type: 'text', placeholder: 'Rian Hidayat', category: 'Data Siswa Pindahan' },
      { key: 'nisn', label: 'NISN', type: 'text', placeholder: '0075543210', category: 'Data Siswa Pindahan' },
      { key: 'originSchool', label: 'Sekolah Asal', type: 'text', placeholder: 'SMA Negeri 3 Yogyakarta', category: 'Data Siswa Pindahan' },
      { key: 'originClass', label: 'Kelas Asal', type: 'text', placeholder: 'XI MIPA', category: 'Data Siswa Pindahan' },
      
      { key: 'acceptedClass', label: 'Diterima di Kelas', type: 'text', placeholder: 'XI MIPA 5', category: 'Penerimaan' },
      { key: 'acceptedDate', label: 'Tanggal Mulai Masuk', type: 'date', defaultValue: new Date().toISOString().split('T')[0], category: 'Penerimaan' },
      
      { key: 'closingNotes', label: 'Penutup Surat', type: 'textarea', defaultValue: 'Pihak sekolah menyatakan siap menerima siswa tersebut di atas dengan catatan seluruh kelengkapan administrasi mutasi dapodik dan surat pelepasan dari sekolah asal telah terpenuhi lengkap.', category: 'Penerimaan' }
    ]
  }
};

// Date Formatter Helper (Indonesian Format)
export function formatIndonesianDate(dateString: string): string {
  if (!dateString) return '';
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch (e) {
    return dateString;
  }
}
