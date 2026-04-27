const path = require('path');
const rootEnv = path.resolve(__dirname, '../../../.env');
require('dotenv').config({ path: rootEnv });

const { getFirebase } = require('../services/firebase');

/**
 * Configure target bucket for CORS to allow web uploads and previews.
 * This runs once from the server terminal.
 */
async function setupStorage() {
    const admin = getFirebase();
    if (!admin) {
        console.error('❌ Firebase not configured in .env');
        return;
    }

    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
        console.error('❌ FIREBASE_STORAGE_BUCKET not set in .env');
        return;
    }

    try {
        const bucket = admin.storage().bucket(bucketName);

        console.log(`Setting CORS for bucket: ${bucketName}...`);

        await bucket.setCorsConfiguration([
            {
                origin: ['*'], // In production, replace with your actual domains
                method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                responseHeader: ['Content-Type', 'Authorization', 'Content-Length', 'User-Agent', 'x-goog-resumable'],
                maxAgeSeconds: 3600,
            },
        ]);

        console.log('✅ CORS configuration updated successfully.');

        // Check if bucket is accessible
        const [exists] = await bucket.exists();
        if (exists) {
            console.log('✅ Bucket is accessible by the Service Account.');
        } else {
            console.warn('⚠ Bucket does not seem to exist. Check the name in Firebase Console.');
        }

    } catch (err) {
        console.error('❌ Error configuring storage:', err.message);
    } finally {
        process.exit();
    }
}

setupStorage();
