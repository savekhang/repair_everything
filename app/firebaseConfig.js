import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB4Fa-EsXKMnS3EXVdrZXqDKFyZ2f_dVFw",
  authDomain: "repair-everything.firebaseapp.com",
  projectId: "repair-everything",
  storageBucket: "repair-everything.appspot.com",
  messagingSenderId: "545459958729",
  appId: "1:545459958729:web:8e7943aaa8cf1f9e79ae18"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
