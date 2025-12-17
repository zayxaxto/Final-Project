// firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  // แทนที่ด้วยข้อมูล config ของ Firebase project คุณ
  apiKey: "AIzaSyC99iAkVnUwfZrdiybtMTO3EWFBPfrEnAI",
  authDomain: "coderaffy.firebaseapp.com",
  databaseURL: "https://coderaffy-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "coderaffy",
  storageBucket: "coderaffy.firebasestorage.app",
  messagingSenderId: "180678219541",
  appId: "1:180678219541:web:ac8ea0c4cf895e578abb1c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

// Export both database and app
export { database };
export default app;