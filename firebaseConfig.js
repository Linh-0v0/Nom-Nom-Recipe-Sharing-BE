const { initializeApp } = require('firebase/app')
const { getStorage } = require('firebase/storage')

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBjsRDNwvUVB9Bim4DX5wfg6tUFPIDb3Tc',
  authDomain: 'nomnomrecipes-ca468.firebaseapp.com',
  projectId: 'nomnomrecipes-ca468',
  storageBucket: 'nomnomrecipes-ca468.appspot.com',
  messagingSenderId: '601323314946',
  appId: '1:601323314946:web:d38facc4f76ab83b796c1b',
  measurementId: 'G-4V17ZN8MNN'
}

const app = initializeApp(firebaseConfig)

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage(app)
module.exports = { firebaseConfig, storage }
