const { cert, getApps, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const {
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_PROJECT_ID,
} = require('./env');

let firebaseAuthInstance = null;

try {
  const isConfigured = Boolean(FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY);
  if (isConfigured) {
    const rawKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    const app = getApps()[0] || initializeApp({
      credential: cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: rawKey,
      }),
    });
    firebaseAuthInstance = getAuth(app);
    console.log('[Firebase Admin] Service account initialized successfully.');
  }
} catch (error) {
  console.warn(`[Firebase Admin Warning] Could not initialize Firebase Admin SDK (${error.message}). The backend is running in client-auth fallback mode.`);
  firebaseAuthInstance = null;
}

module.exports = firebaseAuthInstance;