import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFbpF9Q0BalP0JFvTvEwRo-RQ2PBExGH4",
  authDomain: "shuttle-tracker-a8ee8.firebaseapp.com",
  databaseURL: "https://shuttle-tracker-a8ee8-default-rtdb.firebaseio.com",
  projectId: "shuttle-tracker-a8ee8",
  storageBucket: "shuttle-tracker-a8ee8.firebasestorage.app",
  messagingSenderId: "791614614845",
  appId: "1:791614614845:web:87b6c7fdd1ffc5b4d5a954",
  measurementId: "G-6Q2KDPCS9E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

export default app;
