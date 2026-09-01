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
import { DEFAULT_SCHOOL_PROFILE } from '../components/LetterheadPreview';

export interface GeneratedLetter {
  id: string;
  typeId: string;
  typeName: string;
  refNumber: string;
  recipientName: string;
  dateCreated: string;
  variables: Record<string, string>;
  customBodyHtml?: string; // Optional custom edited HTML content
}

const DEFAULT_PROFILE: SchoolProfile = DEFAULT_SCHOOL_PROFILE;

// In-memory cache variables
let cachedProfile: SchoolProfile | null = null;
let cachedHistory: GeneratedLetter[] | null = null;

let profilePromise: Promise<SchoolProfile> | null = null;
let historyPromise: Promise<GeneratedLetter[]> | null = null;

// Clean cache on logout
export const clearStorageCache = (): void => {
  cachedProfile = null;
  cachedHistory = null;
  profilePromise = null;
  historyPromise = null;
};

// ==================== LOCAL STORAGE HELPERS ====================

const getLocalProfile = (): SchoolProfile | null => {
  try {
    const stored = localStorage.getItem('school_profile');
    if (stored) {
      return JSON.parse(stored) as SchoolProfile;
    }
  } catch (e) {
    console.warn('Gagal membaca school_profile dari localStorage:', e);
  }
  return null;
};

const saveLocalProfile = (profile: SchoolProfile): void => {
  try {
    localStorage.setItem('school_profile', JSON.stringify(profile));
  } catch (e) {
    console.warn('Gagal menyimpan school_profile ke localStorage:', e);
  }
};

const getLocalHistory = (): GeneratedLetter[] => {
  try {
    const stored = localStorage.getItem('smart_letter_history');
    if (stored) {
      return JSON.parse(stored) as GeneratedLetter[];
    }
  } catch (e) {
    console.warn('Gagal membaca smart_letter_history dari localStorage:', e);
  }
  return [];
};

const saveLocalHistory = (history: GeneratedLetter[]): void => {
  try {
    localStorage.setItem('smart_letter_history', JSON.stringify(history));
  } catch (e) {
    console.warn('Gagal menyimpan smart_letter_history ke localStorage:', e);
  }
};

// ==================== PROFILE FUNCTIONS ====================

// Fetch raw profile data directly from Firestore
const fetchSchoolProfileRaw = async (): Promise<SchoolProfile> => {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Firestore timeout')), 2500)
  );

  const fetchPromise = (async () => {
    const docRef = doc(db, 'settings', 'school_profile');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as SchoolProfile;
      const merged: SchoolProfile = {
        ...DEFAULT_PROFILE,
        ...data,
        deptName: (data.deptName && data.deptName.includes('DINAS PENDIDIKAN')) 
          ? data.deptName 
          : DEFAULT_PROFILE.deptName,
        logoUrl: data.logoUrl || DEFAULT_PROFILE.logoUrl,
        logoKananUrl: data.logoKananUrl || DEFAULT_PROFILE.logoKananUrl,
        signatureBarcodeUrl: data.signatureBarcodeUrl || DEFAULT_PROFILE.signatureBarcodeUrl,
        useSignatureBarcode: data.useSignatureBarcode !== undefined ? data.useSignatureBarcode : true,
      };
      saveLocalProfile(merged); // Sync to localStorage
      return merged;
    } else {
      const localData = getLocalProfile();
      const profileToSave: SchoolProfile = {
        ...DEFAULT_PROFILE,
        ...(localData || {}),
        deptName: (localData?.deptName && localData.deptName.includes('DINAS PENDIDIKAN')) 
          ? localData.deptName 
          : DEFAULT_PROFILE.deptName,
        logoUrl: localData?.logoUrl || DEFAULT_PROFILE.logoUrl,
        logoKananUrl: localData?.logoKananUrl || DEFAULT_PROFILE.logoKananUrl,
        signatureBarcodeUrl: localData?.signatureBarcodeUrl || DEFAULT_PROFILE.signatureBarcodeUrl,
        useSignatureBarcode: localData?.useSignatureBarcode !== undefined ? localData.useSignatureBarcode : true,
      };
      setDoc(docRef, profileToSave).catch(() => {});
      saveLocalProfile(profileToSave);
      return profileToSave;
    }
  })();

  try {
    return await Promise.race([fetchPromise, timeoutPromise]) as SchoolProfile;
  } catch (error) {
    console.warn('Gagal mengambil profil sekolah dari Firestore, menggunakan data local storage atau default:', error);
    const local = getLocalProfile();
    return {
      ...DEFAULT_PROFILE,
      ...(local || {}),
      deptName: (local?.deptName && local.deptName.includes('DINAS PENDIDIKAN')) 
        ? local.deptName 
        : DEFAULT_PROFILE.deptName,
      logoUrl: local?.logoUrl || DEFAULT_PROFILE.logoUrl,
      logoKananUrl: local?.logoKananUrl || DEFAULT_PROFILE.logoKananUrl,
      signatureBarcodeUrl: local?.signatureBarcodeUrl || DEFAULT_PROFILE.signatureBarcodeUrl,
      useSignatureBarcode: local?.useSignatureBarcode !== undefined ? local.useSignatureBarcode : true,
    };
  }
};

export const getSchoolProfile = async (bypassCache = false): Promise<SchoolProfile> => {
  if (!cachedProfile) {
    cachedProfile = getLocalProfile();
  }

  if (cachedProfile && !bypassCache) {
    if (!profilePromise) {
      profilePromise = fetchSchoolProfileRaw().then(updated => {
        cachedProfile = updated;
        profilePromise = null;
        return updated;
      }).catch(() => {
        profilePromise = null;
        return cachedProfile!;
      });
    }
    return cachedProfile;
  }

  if (profilePromise && !bypassCache) {
    return profilePromise;
  }

  profilePromise = fetchSchoolProfileRaw().then(data => {
    cachedProfile = data;
    profilePromise = null;
    return data;
  }).catch(() => {
    profilePromise = null;
    const fallback = getLocalProfile() || DEFAULT_PROFILE;
    cachedProfile = fallback;
    return fallback;
  });

  return profilePromise;
};

export const saveSchoolProfile = async (profile: SchoolProfile): Promise<void> => {
  // Always save locally immediately
  saveLocalProfile(profile);
  cachedProfile = profile;

  try {
    const docRef = doc(db, 'settings', 'school_profile');
    const savePromise = setDoc(docRef, profile);
    const timeoutPromise = new Promise<void>((resolve) =>
      setTimeout(() => resolve(), 2500)
    );
    await Promise.race([savePromise, timeoutPromise]);
  } catch (error) {
    console.warn('Penyimpanan ke Firestore offline/tertunda, data disimpan aman di cache lokal:', error);
  }
};

// ==================== LETTER HISTORY FUNCTIONS ====================

// Fetch raw letter history directly from Firestore with localStorage fallback
const fetchLetterHistoryRaw = async (): Promise<GeneratedLetter[]> => {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Firestore timeout')), 2500)
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
        customBodyHtml: data.customBodyHtml || '',
      });
    });
    
    if (history.length > 0) {
      saveLocalHistory(history);
    }
    return history;
  })();

  try {
    return await Promise.race([fetchPromise, timeoutPromise]) as GeneratedLetter[];
  } catch (error) {
    console.warn('Gagal mengambil riwayat surat dari Firestore dalam 2.5 detik, menggunakan localStorage:', error);
    return getLocalHistory();
  }
};

export const getLetterHistory = async (bypassCache = false): Promise<GeneratedLetter[]> => {
  if (!cachedHistory) {
    cachedHistory = getLocalHistory();
  }

  if (cachedHistory && cachedHistory.length > 0 && !bypassCache) {
    if (!historyPromise) {
      historyPromise = fetchLetterHistoryRaw().then(updated => {
        if (updated && updated.length > 0) {
          cachedHistory = updated;
        }
        historyPromise = null;
        return cachedHistory || updated;
      }).catch(() => {
        historyPromise = null;
        return cachedHistory || [];
      });
    }
    return cachedHistory;
  }

  if (historyPromise && !bypassCache) {
    return historyPromise;
  }

  historyPromise = fetchLetterHistoryRaw().then(data => {
    cachedHistory = data;
    historyPromise = null;
    return data;
  }).catch(() => {
    historyPromise = null;
    const fallback = getLocalHistory();
    cachedHistory = fallback;
    return fallback;
  });

  return historyPromise;
};

export const saveLetterHistory = async (history: GeneratedLetter[]): Promise<void> => {
  // Always update local cache and storage immediately
  saveLocalHistory(history);
  cachedHistory = history;

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
        customBodyHtml: letter.customBodyHtml || '',
      });
    });
    const timeoutPromise = new Promise<void>((resolve) => setTimeout(() => resolve(), 3000));
    await Promise.race([Promise.all(promises), timeoutPromise]);
  } catch (error) {
    console.warn('Gagal sinkronisasi seluruh riwayat surat ke Firestore, data aman di lokal:', error);
  }
};

export const addLetterToHistory = async (
  letter: Omit<GeneratedLetter, 'id' | 'dateCreated'>
): Promise<GeneratedLetter> => {
  const dateCreated = new Date().toISOString();
  const localId = `letter_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  const newLetter: GeneratedLetter = {
    id: localId,
    typeId: letter.typeId,
    typeName: letter.typeName,
    refNumber: letter.refNumber,
    recipientName: letter.recipientName,
    dateCreated,
    variables: letter.variables,
    customBodyHtml: letter.customBodyHtml || '',
  };

  // 1. Immediately update cache and localStorage
  const currentHistory = cachedHistory || getLocalHistory();
  const updatedHistory = [newLetter, ...currentHistory];
  cachedHistory = updatedHistory;
  saveLocalHistory(updatedHistory);

  // 2. Background async save to Firestore with timeout
  try {
    const lettersCol = collection(db, 'letters');
    const docData = {
      typeId: letter.typeId,
      typeName: letter.typeName,
      refNumber: letter.refNumber,
      recipientName: letter.recipientName,
      dateCreated,
      variables: letter.variables,
      customBodyHtml: letter.customBodyHtml || '',
    };
    
    const savePromise = addDoc(lettersCol, docData);
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
    
    const res = await Promise.race([savePromise, timeoutPromise]);
    if (res && 'id' in res) {
      newLetter.id = res.id;
      // Update with server id in memory
      saveLocalHistory(cachedHistory);
    }
  } catch (error) {
    console.warn('Gagal menambahkan surat ke Firestore server, riwayat tersimpan lokal secara aman:', error);
  }

  return newLetter;
};

export const deleteLetterFromHistory = async (id: string): Promise<void> => {
  // 1. Update local cache and storage immediately
  const currentHistory = cachedHistory || getLocalHistory();
  const updatedHistory = currentHistory.filter(letter => letter.id !== id);
  cachedHistory = updatedHistory;
  saveLocalHistory(updatedHistory);

  // 2. Delete from Firestore in background
  try {
    const docRef = doc(db, 'letters', id);
    const deletePromise = deleteDoc(docRef);
    const timeoutPromise = new Promise<void>((resolve) => setTimeout(() => resolve(), 2500));
    await Promise.race([deletePromise, timeoutPromise]);
  } catch (error) {
    console.warn('Gagal menghapus surat dari Firestore server, surat telah dihapus secara lokal:', error);
  }
};
