import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  };

  if (serviceAccount.project_id && serviceAccount.private_key && serviceAccount.client_email) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    console.warn('Firebase Admin env vars not configured, using applicationDefault()');
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
}

export const auth = admin.auth();
export default admin;
