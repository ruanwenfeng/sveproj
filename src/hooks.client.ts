// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { dev } from '$app/environment';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: 'AIzaSyDLqcmtWewkv7-d6KkHIxX3IOz-Mm8UovM',
	authDomain: 'svedemo-aef9f.firebaseapp.com',
	projectId: 'svedemo-aef9f',
	storageBucket: 'svedemo-aef9f.appspot.com',
	messagingSenderId: '90050776349',
	appId: '1:90050776349:web:01f6fc6c974eb515dde5f4',
	measurementId: 'G-LMWBYN914V'
};
if (dev) self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const appCheck = initializeAppCheck(app, {
	provider: new ReCaptchaV3Provider('6Lf4TXAkAAAAADFGff5n40pKIJpbIJ2Z3NqPKrqG'),

	// Optional argument. If true, the SDK automatically refreshes App Check
	// tokens as needed.
	isTokenAutoRefreshEnabled: true
});
const functions = getFunctions(app);
// connectFunctionsEmulator(functions, "localhost", 5173);
export default { app, db, auth, appCheck, functions };
