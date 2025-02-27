import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAVbImIcm40ZbAyyUHa9jlx-nSyPv-d3BY",
  authDomain: "domo-2173c.firebaseapp.com",
  projectId: "domo-2173c",
  storageBucket: "domo-2173c.appspot.com",
  messagingSenderId: "220101478721",
  appId: "1:220101478721:web:f92447a03fdb0a1fefb9c0",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, GoogleAuthProvider, signInWithCredential, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword };
