import { doc, getDoc, setDoc, getDocs, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const ADMINS_COLLECTION = 'admins';

/**
 * Check if a given email is an admin by reading from Firestore.
 * The `admins` collection uses the email as the document ID.
 * Document must exist and have `active: true`.
 */
export async function isAdminInFirestore(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  try {
    const ref  = doc(db, ADMINS_COLLECTION, email);
    const snap = await getDoc(ref);
    return snap.exists() && snap.data()?.active === true;
  } catch {
    return false;
  }
}

/**
 * Add a new admin email to Firestore.
 * Call this from the Firebase Console OR programmatically.
 */
export async function addAdmin(email: string, addedByEmail?: string): Promise<void> {
  await setDoc(doc(db, ADMINS_COLLECTION, email), {
    email,
    active: true,
    addedBy: addedByEmail || 'system',
    addedAt: serverTimestamp(),
  });
}

/**
 * Deactivate an admin (sets active: false, does not delete the document).
 */
export async function removeAdmin(email: string): Promise<void> {
  await setDoc(doc(db, ADMINS_COLLECTION, email), { active: false }, { merge: true });
}

/**
 * List all admin emails from Firestore.
 */
export async function listAdmins(): Promise<{ email: string; active: boolean }[]> {
  const snap = await getDocs(collection(db, ADMINS_COLLECTION));
  return snap.docs.map(d => ({
    email: d.id,
    active: d.data().active === true,
  }));
}
