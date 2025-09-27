import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {getAuth} from "firebase/auth";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
  apiKey: "AIzaSyDK8bxQOAggQVebFmtKcMbywvYsEyq82wc",
  authDomain: "lm-edutech.firebaseapp.com",
  projectId: "lm-edutech",
  storageBucket: "lm-edutech.firebasestorage.app",
  messagingSenderId: "703344813248",
  appId: "1:703344813248:web:bf6abec3d1f905b0ca7925",
  measurementId: "G-40BBZ7M5J6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
const auth = getAuth(app);

export {auth}

export default db