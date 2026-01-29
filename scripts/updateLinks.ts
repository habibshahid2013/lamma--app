
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from '../src/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

async function updateLinks() {
  console.log('Updating creator links...');

  try {
    // Omar Suleiman
    console.log('Updating Omar Suleiman...');
    await updateDoc(doc(db, 'creators', 'omar-suleiman'), {
      'socialLinks.youtube': 'https://www.youtube.com/@OmarSuleiman',
      'socialLinks.podcast': 'https://feeds.simplecast.com/6lezKjkD'
    });

    // Nouman Ali Khan
    console.log('Updating Nouman Ali Khan...');
    await updateDoc(doc(db, 'creators', 'nouman-ali-khan'), {
        'socialLinks.youtube': 'https://www.youtube.com/@NAaborisays'
    });

    // Mufti Menk
    console.log('Updating Mufti Menk...');
    await updateDoc(doc(db, 'creators', 'mufti-menk'), {
        'socialLinks.youtube': 'https://www.youtube.com/@MuftiMenk'
    });

    console.log('Update complete! ✅');
    process.exit(0);
  } catch (error) {
    console.error('Error updating documents:', error);
    console.log('NOTE: If this failed due to permissions, please update the documents via Firebase Console manually as per your instructions.');
    process.exit(1);
  }
}

updateLinks();
