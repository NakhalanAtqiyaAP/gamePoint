import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDC-Izz-sqTRzF5hUwLdNUj2RV5e4umP00",
  authDomain: "skor-game-web.firebaseapp.com",
  projectId: "skor-game-web",
  storageBucket: "skor-game-web.firebasestorage.app",
  messagingSenderId: "806800019428",
  appId: "1:806800019428:web:95979a38269dd06c7681f1",
  measurementId: "G-CRLX7GTG55"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, getDocs };
