const path = require('path');
const rootEnv = path.resolve(__dirname, '../../../.env');
require('dotenv').config({ path: rootEnv });

const { getFirebase } = require('../services/firebase');

/**
 * Configures Lifecycle Management for the bucket to auto-delete old temporary files.
 */
async function setupLifecycle() {
    const admin = getFirebase();
    if (!admin) {
        console.error('❌ Firebase not configured');
        return;
    }

    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
        console.error('❌ FIREBASE_STORAGE_BUCKET not set');
        return;
    }

    try {
        const bucket = admin.storage().bucket(bucketName);

        console.log(`Configuring Lifecycle Policy for: ${bucketName}...`);

        // Lifecycle rule: Delete objects older than 7 days
        // This protects your storage from abandoned application files.
        await bucket.setStorageCustomJob({
            lifecycle: {
                rule: [
                    {
                        action: { type: 'Delete' },
                        condition: { age: 7 } // Days
                    }
                ]
            }
        });

        // Note: The above method name differs slightly in different Node SDK versions.
        // The standard way in @google-cloud/storage is bucket.setMetadata()

        await bucket.setMetadata({
            lifecycle: {
                rule: [
                    {
                        action: { type: 'Delete' },
                        condition: { age: 7 } // Delete after 7 days
                    }
                ]
            }
        });

        console.log('✅ Success: Files older than 7 days will be automatically deleted.');
        console.log('   This rule applies to all objects in the bucket.');

    } catch (err) {
        console.error('❌ Error setting lifecycle:', err.message);
    } finally {
        process.exit();
    }
}

setupLifecycle();
