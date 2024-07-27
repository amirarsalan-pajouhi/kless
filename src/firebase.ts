import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyBF4vX12zP594POJkq7NzrVadNijlQul4E",
  authDomain: "qless-a48d3.firebaseapp.com",
  projectId: "qless-a48d3",
  storageBucket: "qless-a48d3.appspot.com",
  messagingSenderId: "1086384840612",
  appId: "1:1086384840612:web:59bad6b45a90171971ab31",
  measurementId: "G-M2RC9VXK3V",
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
