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

// In-memory cache variables
let cachedProfile: SchoolProfile | null = null;
let cachedHistory: GeneratedLetter[] | null = null;

let profilePromise: Promise<SchoolProfile> | null = null;
let historyPromise: Promise<GeneratedLetter[]> | null = null;

// Fungsi untuk membersihkan cache saat user logout
export const clearStorageCache = (): void => {
  cachedProfile = null;
  cachedHistory = null;
  profilePromise = null;
  historyPromise = null;
};

// Fetch raw profile data directly from Firestore
const fetchSchoolProfileRaw = async (): Promise<SchoolProfile> => {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Firestore timeout')), 3000)
  );

  const fetchPromise = (async () => {
    const docRef = doc(db, 'settings', 'school_profile');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SchoolProfile;
    } else {
      await setDoc(docRef, DEFAULT_PROFILE);
      return DEFAULT_PROFILE;
    }
  })();

  try {
    return await Promise.race([fetchPromise, timeoutPromise]) as SchoolProfile;
  } catch (error) {
    console.warn('Gagal mengambil profil sekolah dari Firestore dalam 3 detik, menggunakan data default lokal:', error);
    return DEFAULT_PROFILE;
  }
};

// Mengambil profil sekolah dari Firestore (dengan proteksi timeout 3 detik, in-memory cache, dan deduplikasi)
export const getSchoolProfile = async (bypassCache = false): Promise<SchoolProfile> => {
  // 1. Jika ada cache, return instan tapi revalidate di background jika tidak sedang fetching
  if (cachedProfile && !bypassCache) {
    if (!profilePromise) {
      profilePromise = fetchSchoolProfileRaw().then(updated => {
        cachedProfile = updated;
        profilePromise = null;
        return updated;
      }).catch(err => {
        profilePromise = null;
        console.warn('Background update profil sekolah gagal:', err);
        return cachedProfile!;
      });
    }
    return cachedProfile;
  }

  // 2. Jika sedang dalam proses fetch, pakai promise yang sama (deduplikasi)
  if (profilePromise && !bypassCache) {
    return profilePromise;
  }

  // 3. Lakukan fetch baru
  profilePromise = fetchSchoolProfileRaw().then(data => {
    cachedProfile = data;
    profilePromise = null;
    return data;
  }).catch(err => {
    profilePromise = null;
    throw err;
  });

  return profilePromise;
};

// Menyimpan profil sekolah ke Firestore
export const saveSchoolProfile = async (profile: SchoolProfile): Promise<void> => {
  try {
    const docRef = doc(db, 'settings', 'school_profile');
    await setDoc(docRef, profile);
    cachedProfile = profile; // Update cache instan
  } catch (error) {
    console.error('Gagal menyimpan profil sekolah ke Firestore:', error);
    throw error;
  }
};

// Fetch raw letter history directly from Firestore
const fetchLetterHistoryRaw = async (): Promise<GeneratedLetter[]> => {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Firestore timeout')), 3000)
  );

  const fetchPromise = (async () => {
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
  })();

  try {
    return await Promise.race([fetchPromise, timeoutPromise]) as GeneratedLetter[];
  } catch (error) {
    console.warn('Gagal mengambil riwayat surat dari Firestore dalam 3 detik, menggunakan array kosong:', error);
    return [];
  }
};

// Mengambil riwayat surat dari Firestore (dengan cache in-memory, deduplikasi, dan background update)
export const getLetterHistory = async (bypassCache = false): Promise<GeneratedLetter[]> => {
  // 1. Jika ada cache, return instan tapi revalidate di background jika tidak sedang fetching
  if (cachedHistory && !bypassCache) {
    if (!historyPromise) {
      historyPromise = fetchLetterHistoryRaw().then(updated => {
        cachedHistory = updated;
        historyPromise = null;
        return updated;
      }).catch(err => {
        historyPromise = null;
        console.warn('Background update riwayat surat gagal:', err);
        return cachedHistory!;
      });
    }
    return cachedHistory;
  }

  // 2. Jika sedang dalam proses fetch, pakai promise yang sama (deduplikasi)
  if (historyPromise && !bypassCache) {
    return historyPromise;
  }

  // 3. Lakukan fetch baru
  historyPromise = fetchLetterHistoryRaw().then(data => {
    cachedHistory = data;
    historyPromise = null;
    return data;
  }).catch(err => {
    historyPromise = null;
    throw err;
  });

  return historyPromise;
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
    cachedHistory = history; // Update cache instan
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
    const newLetter: GeneratedLetter = {
      id: docRef.id,
      ...docData,
    };

    // Update cache dengan menyematkan surat baru di paling depan (descending)
    if (cachedHistory) {
      cachedHistory = [newLetter, ...cachedHistory];
    }

    return newLetter;
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
    
    // Update cache dengan menghapus item tersebut
    if (cachedHistory) {
      cachedHistory = cachedHistory.filter(letter => letter.id !== id);
    }
  } catch (error) {
    console.error('Gagal menghapus surat dari Firestore:', error);
    throw error;
  }
};
