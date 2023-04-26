const admin = require('firebase-admin');

// initialize Firebase admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

// create a reference to Firestore storage
const bucket = admin.storage().bucket();

// generate a unique filename or ID for the image
const filename = 'avatar-' + uuidv4() + '.jpg';

// upload the image file to Firestore
await bucket.upload('path/to/image.jpg', {
  destination: 'avatars/' + filename,
  metadata: {
    contentType: 'image/jpeg',
  },
});
