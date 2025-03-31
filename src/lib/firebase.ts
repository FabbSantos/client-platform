// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// Importação condicional do analytics
import { getAnalytics } from 'firebase/analytics';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDibXcMAe48dw_G9pDM4Ba-405NFoqzMXk",
    authDomain: "nexus-client-platform.firebaseapp.com",
    projectId: "nexus-client-platform",
    storageBucket: "nexus-client-platform.firebasestorage.app",
    messagingSenderId: "457399528309",
    appId: "1:457399528309:web:f2d38fa1c8a5bcb8f7813c",
    measurementId: "G-J6GKZC6V6H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Firestore
const db = getFirestore(app);

// Inicializa o Analytics apenas no cliente (navegador)
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { db, analytics };