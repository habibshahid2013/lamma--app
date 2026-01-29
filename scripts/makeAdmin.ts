// Run with: npx tsx scripts/makeAdmin.ts YOUR_EMAIL
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Note: You need to download service-account-key.json from Firebase Console -> Project Settings -> Service Accounts
// and place it in the project root.
const app = initializeApp({
  credential: cert('./service-account-key.json'),
});

const db = getFirestore();

async function makeAdmin(email: string) {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', email).get();

  if (snapshot.empty) {
    console.log('❌ User not found with email:', email);
    return;
  }

  const userDoc = snapshot.docs[0];
  await userDoc.ref.update({ role: 'admin' });
  console.log('✅ User', email, 'is now an admin!');
}

const email = process.argv[2];
if (!email) {
  console.log('Usage: npx tsx scripts/makeAdmin.ts YOUR_EMAIL');
  process.exit(1);
}

makeAdmin(email);
