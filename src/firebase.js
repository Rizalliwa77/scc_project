// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAVdsOHy2b3PED8dJudJ0oUW4vU9j-n2EA",
  authDomain: "st-catherine-college.firebaseapp.com",
  projectId: "st-catherine-college",
  storageBucket: "st-catherine-college.appspot.com",
  messagingSenderId: "40209137070",
  appId: "1:40209137070:web:3331389785d58c5ffddc3f",
  measurementId: "G-DDFYHZNN69"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;