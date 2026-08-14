import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import type { SchoolProfile } from '../components/LetterheadPreview';

export interface GeneratedLetter {
  id: string;
  typeId: string;
  typeName: string;
  refNumber: string;
  recipientName: string;
  dateCreated: string;
  variables: Record<string, string>;
}

const DEFAULT_PROFILE: SchoolProfile = {
  schoolName: 'SMA NEGERI 1 MERDEKA',
  foundationName: '',
  deptName: 'PEMERINTAH PROVINSI DKI JAKARTA\nDINAS PENDIDIKAN',
  npsn: '12345678',
  address: 'Jl. Merdeka Raya No. 10, Gambir, Jakarta Pusat',
  postalCode: '10110',
  phone: '(021) 1234567',
  email: 'info@sman1merdeka.sch.id',
  website: 'www.sman1merdeka.sch.id',
  logoUrl: '',
  principalName: 'Drs. H. Ahmad Wijaya, M.Pd.',
  principalNip: '197508212003121002',
};

// Mengambil profil sekolah dari Firestore
export const getSchoolProfile = async (): Promise<SchoolProfile> => {
  try {
    const docRef = doc(db, 'settings', 'school_profile');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SchoolProfile;
    } else {
      // Inisialisasi data default di Firestore jika belum ada
      await setDoc(docRef, DEFAULT_PROFILE);
      return DEFAULT_PROFILE;
    }
  } catch (error) {
    console.error('Gagal mengambil profil sekolah dari Firestore:', error);
    return DEFAULT_PROFILE;
  }
};

// Menyimpan profil sekolah ke Firestore
export const saveSchoolProfile = async (profile: SchoolProfile): Promise<void> => {
  try {
    const docRef = doc(db, 'settings', 'school_profile');
    await setDoc(docRef, profile);
  } catch (error) {
    console.error('Gagal menyimpan profil sekolah ke Firestore:', error);
    throw error;
  }
};

// Mengambil riwayat surat dari Firestore (diurutkan berdasarkan tanggal dibuat menurun)
export const getLetterHistory = async (): Promise<GeneratedLetter[]> => {
  try {
    const lettersCol = collection(db, 'letters');
    const q = query(lettersCol, orderBy('dateCreated', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const history: GeneratedLetter[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      history.push({
        id: doc.id,
        typeId: data.typeId,
        typeName: data.typeName,
        refNumber: data.refNumber,
        recipientName: data.recipientName,
        dateCreated: data.dateCreated,
        variables: data.variables,
      });
    });
    return history;
  } catch (error) {
    console.error('Gagal mengambil riwayat surat dari Firestore:', error);
    return [];
  }
};

// Menyimpan ulang/update seluruh riwayat surat (untuk sinkronisasi modifikasi bulk)
export const saveLetterHistory = async (history: GeneratedLetter[]): Promise<void> => {
  try {
    const promises = history.map((letter) => {
      const letterDoc = doc(db, 'letters', letter.id);
      return setDoc(letterDoc, {
        typeId: letter.typeId,
        typeName: letter.typeName,
        refNumber: letter.refNumber,
        recipientName: letter.recipientName,
        dateCreated: letter.dateCreated,
        variables: letter.variables,
      });
    });
    await Promise.all(promises);
  } catch (error) {
    console.error('Gagal menyimpan riwayat surat ke Firestore:', error);
    throw error;
  }
};

// Menambahkan surat baru ke riwayat Firestore
export const addLetterToHistory = async (
  letter: Omit<GeneratedLetter, 'id' | 'dateCreated'>
): Promise<GeneratedLetter> => {
  try {
    const lettersCol = collection(db, 'letters');
    const dateCreated = new Date().toISOString();
    
    const docData = {
      typeId: letter.typeId,
      typeName: letter.typeName,
      refNumber: letter.refNumber,
      recipientName: letter.recipientName,
      dateCreated,
      variables: letter.variables,
    };
    
    const docRef = await addDoc(lettersCol, docData);
    return {
      id: docRef.id,
      ...docData,
    };
  } catch (error) {
    console.error('Gagal menambahkan surat ke Firestore:', error);
    throw error;
  }
};

// Menghapus surat dari riwayat Firestore
export const deleteLetterFromHistory = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'letters', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Gagal menghapus surat dari Firestore:', error);
    throw error;
  }
};
