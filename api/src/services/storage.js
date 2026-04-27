const { getFirebase } = require('./firebase');

/**
 * Uploads a file buffer to Google Cloud Storage (Firebase Storage).
 * @param {Buffer} buffer - File content
 * @param {string} destination - Path in bucket (e.g. 'applications/doc-123/dni.jpg')
 * @param {string} mimetype - Content type
 * @returns {Promise<string>} - Public URL of the uploaded file
 */
async function uploadToStorage(buffer, destination, mimetype) {
    const admin = getFirebase();
    if (!admin) throw new Error('Firebase not configured');

    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
    const bucket = admin.storage().bucket(bucketName);
    const file = bucket.file(destination);

    try {
        await file.save(buffer, {
            metadata: { contentType: mimetype },
            public: true, // Make it public so we can use the URL directly
        });
    } catch (err) {
        console.error('[Firebase Storage] Error in file.save:', err);
        throw err;
    }

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
    console.log('[Firebase Storage] Upload success →', publicUrl);
    return publicUrl;
}

/**
 * Moves/Renames a file within the bucket. Useful for promoting temp docs to permanent.
 * @param {string} source - Current path (e.g. 'applications/temp-dni.jpg')
 * @param {string} destination - New path (e.g. 'doctors/doc-123/dni.jpg')
 */
async function moveFile(source, destination) {
    const admin = getFirebase();
    if (!admin) throw new Error('Firebase not configured');

    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
    const bucket = admin.storage().bucket(bucketName);

    try {
        const file = bucket.file(source);
        await file.copy(destination);
        await file.delete();

        const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
        return publicUrl;
    } catch (err) {
        console.error('[Firebase Storage] Error moving file:', err);
        throw err;
    }
}

module.exports = { uploadToStorage, moveFile };
