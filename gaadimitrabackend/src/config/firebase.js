import admin from 'firebase-admin';
import logger from '../utils/logger.js';

let firebaseApp = null;
let isConfigured = false;

export const initFirebase = () => {
  if (firebaseApp) return firebaseApp;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    logger.warn('Firebase credentials not provided in environment. Push notifications will run in mock mode.');
    isConfigured = false;
    return null;
  }

  try {
    // Handle escaped newlines in environment variable
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey
      })
    });

    isConfigured = true;
    logger.info('Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to initialize Firebase Admin SDK');
    isConfigured = false;
    return null;
  }
};

export const getFirebaseAdmin = () => {
  if (!firebaseApp && !isConfigured) {
    return initFirebase();
  }
  return firebaseApp;
};

export const isFirebaseReady = () => isConfigured && !!firebaseApp;

export default { initFirebase, getFirebaseAdmin, isFirebaseReady };
