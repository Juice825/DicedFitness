import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAO2JgrM56buPxY2cq-qo4tKjczcPEPwtU",
  authDomain: "diced-dcd86.firebaseapp.com",
  projectId: "diced-dcd86",
  storageBucket: "diced-dcd86.firebasestorage.app",
  messagingSenderId: "1002578846450",
  appId: "1:1002578846450:web:774257db4c5fd9df03e66b",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
