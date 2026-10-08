import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDly4NYRbQ4Hyhmvzk38oAwmAN57cDOcb0",
  authDomain: "safetours-187e5.firebaseapp.com",
  databaseURL: "https://safetours-187e5-default-rtdb.firebaseio.com",
  storageBucket: "safetours-187e5.firebasestorage.app",
};

const app = initializeApp(firebaseConfig);

export const database = getDatabase(app);