import Dexie, { type Table } from 'dexie';

export interface SchoolSettings {
  id?: number;
  schoolName: string;
  npsn: string;
  governingBody: string; // e.g. Pemerintah Provinsi Jawa Barat, Dinas Pendidikan
  address: string;
  phone: string;
  email: string;
  website: string;
  principalName: string;
  principalNip: string;
  principalRank: string; // e.g. Pembina Tingkat I, IV/b
  logoUrl: string; // Base64 image
  signatureUrl: string; // Base64 image signature/stamp
  postCode: string;
}

export interface GeneratedLetter {
  id?: number;
  title: string;
  type: 'skl' | 'undangan' | 'tugas' | 'pengantar' | 'rekomendasi' | 'pindahan';
  refNumber: string; // Nomor Surat
  createdAt: string;
  recipientName: string;
  recipientDetail: string; // NISN, NIP, or organisation
  formData: Record<string, any>; // Variable data fields for that specific template
}

export interface LetterTemplate {
  id?: number;
  name: string;
  type: 'skl' | 'undangan' | 'tugas' | 'pengantar' | 'rekomendasi' | 'pindahan';
  description: string;
  formData: Record<string, any>;
  createdAt: string;
}

class SchoolInvitationDatabase extends Dexie {
  settings!: Table<SchoolSettings>;
  letters!: Table<GeneratedLetter>;
  templates!: Table<LetterTemplate>;

  constructor() {
    super('SchoolInvitationDB');
    this.version(1).stores({
      settings: '++id',
      letters: '++id, type, refNumber, createdAt, recipientName',
      templates: '++id, type, name, createdAt',
    });
  }
}

export const db = new SchoolInvitationDatabase();

// Helper to seed default settings if empty
export async function seedDefaultSettings(): Promise<SchoolSettings> {
  const count = await db.settings.count();
  const defaultSettings: SchoolSettings = {
    schoolName: 'SMA NEGERI 1 KOTA BANDUNG',
    npsn: '20219253',
    governingBody: 'PEMERINTAH PROVINSI JAWA BARAT\nDINAS PENDIDIKAN',
    address: 'Jalan Belitung No. 8, Merdeka, Kec. Sumur Bandung, Kota Bandung, Jawa Barat',
    postCode: '40113',
    phone: '(022) 4204556',
    email: 'info@sman1bdg.sch.id',
    website: 'sman1bdg.sch.id',
    principalName: 'Drs. H. Maman Suherman, M.Pd.',
    principalNip: '19680324 199303 1 002',
    principalRank: 'Pembina Utama Muda, IV/c',
    logoUrl: '', // Will be filled dynamically by uploader
    signatureUrl: ''
  };

  if (count === 0) {
    const id = await db.settings.add(defaultSettings);
    return { ...defaultSettings, id };
  }
  
  const allSettings = await db.settings.toArray();
  return allSettings[0];
}
