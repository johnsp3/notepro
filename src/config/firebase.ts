// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getRequiredEnvVar } from "../utils/env";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: getRequiredEnvVar("REACT_APP_FIREBASE_API_KEY"),
  authDomain: getRequiredEnvVar("REACT_APP_FIREBASE_AUTH_DOMAIN"),
  projectId: getRequiredEnvVar("REACT_APP_FIREBASE_PROJECT_ID"),
  storageBucket: getRequiredEnvVar("REACT_APP_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getRequiredEnvVar("REACT_APP_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getRequiredEnvVar("REACT_APP_FIREBASE_APP_ID")
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const storage = getStorage(app);
const auth = getAuth(app);

export { app, storage, auth }; 