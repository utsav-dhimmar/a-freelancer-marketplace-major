import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Initialize Firebase Admin SDK with service account credentials.
 * Place your service account JSON at: backend/src/config/firebase-service-account.json
 */

const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  resolve(import.meta.dirname, 'firebase-service-account.json');

let serviceAccount: admin.ServiceAccount;

try {
  const raw = readFileSync(serviceAccountPath, 'utf-8');
  serviceAccount = JSON.parse(raw) as admin.ServiceAccount;
} catch {
  console.error(
    `[FIREBASE] Failed to read service account file at: ${serviceAccountPath}`,
  );
  console.error(
    '[FIREBASE] Please place your Firebase service account JSON file at backend/src/config/firebase-service-account.json',
  );
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const db = admin.firestore();
export default admin;
