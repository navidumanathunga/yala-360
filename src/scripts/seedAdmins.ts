/**
 * One-time seed script — run with:
 *   npx tsx src/scripts/seedAdmins.ts
 *
 * This adds the initial admin emails to Firestore.
 * After running once, use the Firebase Console to manage admins.
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'yala-360',
  appId: '1:330576963431:web:3bf0e8d51ffea865c3b1c2',
  storageBucket: 'yala-360.firebasestorage.app',
  apiKey: 'AIzaSyDx3SBGyoB2gZC3qhUL46E0UIjIoTNTpRE',
  authDomain: 'yala-360.firebaseapp.com',
  messagingSenderId: '330576963431',
};

const INITIAL_ADMINS = [
  'vimukthiubeysekera@gmail.com',
  'vimukthi116119@gmail.com',
  'admin@yala360.com',
];

async function seed() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log('Seeding admin emails...');
  for (const email of INITIAL_ADMINS) {
    await setDoc(doc(db, 'admins', email), {
      email,
      active: true,
      addedBy: 'seed-script',
      addedAt: serverTimestamp(),
    });
    console.log(`  ✅  ${email}`);
  }
  console.log('Done!');
}

seed().catch(e => {
  console.error(e);
});
