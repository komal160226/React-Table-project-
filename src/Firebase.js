
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDenroAW2_K3OtBl0e-Dd2I0bHNS4FfpAM",
  authDomain: "studentproject-68c44.firebaseapp.com",
  projectId: "studentproject-68c44",
  storageBucket: "studentproject-68c44.appspot.com",
  messagingSenderId: "449995064691",
  appId: "1:449995064691:web:ff1f3f7fd0ae90b1c33106"
};


const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);