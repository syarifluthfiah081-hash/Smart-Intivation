import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'guru';
}

// Inisialisasi Auth (tidak diperlukan lagi di Firebase, tapi kita biarkan kosong untuk backward compatibility)
export const initAuth = () => {};

// Mengambil User yang sedang login secara synchronous (kurang disarankan untuk Firebase, 
// gunakan subscribeToAuthChanges di App.tsx sebagai gantinya)
export const getCurrentUser = (): User | null => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;
  
  // Karena async, ini mungkin kosong pada mount awal. 
  // App.tsx akan diubah menggunakan listener onAuthStateChanged.
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    fullName: firebaseUser.displayName || 'Pengguna',
    role: 'guru', // default role
  };
};

export const loginFirebase = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  const firebaseUser = userCredential.user;
  
  // Ambil detail data user dari Firestore
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  if (!userDoc.exists()) {
    // Jika dokumen user belum ada, buat dokumen default
    const defaultUser: Omit<User, 'id'> = {
      email: firebaseUser.email || '',
      fullName: firebaseUser.displayName || 'Pengguna Baru',
      role: 'guru',
    };
    await setDoc(doc(db, 'users', firebaseUser.uid), defaultUser);
    return {
      id: firebaseUser.uid,
      ...defaultUser,
    };
  }
  
  const userData = userDoc.data();
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    fullName: userData.fullName || '',
    role: userData.role || 'guru',
  };
};

export const registerFirebase = async (
  email: string, 
  password: string, 
  fullName: string, 
  role: 'admin' | 'guru'
): Promise<User> => {
  // Buat kredensial di Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  const firebaseUser = userCredential.user;
  
  // Simpan data detail profil ke Firestore
  const newUser: Omit<User, 'id'> = {
    email: email.trim().toLowerCase(),
    fullName: fullName.trim(),
    role,
  };
  
  await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
  
  return {
    id: firebaseUser.uid,
    ...newUser,
  };
};

export const logoutFirebase = async (): Promise<void> => {
  await signOut(auth);
};

// Listener perubahan status login Firebase
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          callback({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            fullName: userData.fullName || '',
            role: userData.role || 'guru',
          });
        } else {
          callback({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            fullName: firebaseUser.displayName || 'Pengguna Baru',
            role: 'guru',
          });
        }
      } catch (err) {
        console.error('Gagal mengambil profil user dari Firestore:', err);
        callback({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          fullName: firebaseUser.displayName || 'Pengguna',
          role: 'guru',
        });
      }
    } else {
      callback(null);
    }
  });
};
