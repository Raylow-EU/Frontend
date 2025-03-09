import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  initializeFirestore,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);

// Configure Firestore to use long polling instead of QUIC/WebSockets
// This can help avoid QUIC protocol errors
let db;
try {
  // Initialize Firestore with custom settings to avoid QUIC protocol errors
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true, // Use long polling instead of WebSockets/QUIC
    experimentalAutoDetectLongPolling: true,
    cacheSizeBytes: 50 * 1024 * 1024, // Increase cache size to 50MB
  });
} catch (error) {
  console.warn("Could not initialize Firestore with custom settings:", error);
  // Fallback to standard initialization
  db = getFirestore(app);
}

const storage = getStorage(app);

// Enable persistence
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting persistence:", error);
});

// Use Firestore emulator if in development
if (
  import.meta.env.DEV &&
  import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true"
) {
  console.log("Using Firestore emulator");
  connectFirestoreEmulator(db, "localhost", 8080);
}

// Export the services for use in other files
export { auth, db, storage };
