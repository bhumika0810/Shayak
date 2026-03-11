import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,

    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

export function initAdmin() {
    if (getApps().length === 0) {
        if (!firebaseConfig.privateKey) {
            console.warn("Firebase Admin: Missing private key. Cloud features might fail.");
            return null;
        }
        initializeApp({
            credential: cert(firebaseConfig),
        });
        console.log("Firebase Admin Initialized");
    }
    return getFirestore();
}