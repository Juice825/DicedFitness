import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAO2JgrM56buPxY2cq-qo4tKjczcPEPwtU",
  authDomain: "diced-dcd86.firebaseapp.com",
  projectId: "diced-dcd86",
  storageBucket: "diced-dcd86.firebasestorage.app",
  messagingSenderId: "1002578846450",
  appId: "1:1002578846450:web:774257db4c5fd9df03e66b",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
export const db = getFirestore(app);
