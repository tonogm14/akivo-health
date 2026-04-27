const admin = require('firebase-admin');

let _firebaseApp = null;

function getFirebase() {
    if (_firebaseApp) return admin;

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

    if (!projectId || !clientEmail || !privateKey) {
        console.warn('[Firebase] Variables no configuradas — servicios deshabilitados');
        return null;
    }

    if (!admin.apps.length) {
        _firebaseApp = admin.initializeApp({
            credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
            storageBucket
        });
    } else {
        _firebaseApp = admin.app();
    }

    return admin;
}

module.exports = { getFirebase, admin };
