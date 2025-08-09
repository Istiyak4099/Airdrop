import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";

const firebaseConfig = {
  "projectId": "aether-assistant-4rs4r",
  "appId": "1:633901286866:web:171a02459b24bb6559f40b",
  "storageBucket": "aether-assistant-4rs4r.firebasestorage.app",
  "apiKey": "AIzaSyBaoDKNmN8TgWrwuhsfk-PEBe1kDx2Hk2o",
  "authDomain": "aether-assistant-4rs4r.firebaseapp.com",
  "messagingSenderId": "633901286866"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const signInWithGoogle = () => {
    return signInWithPopup(auth, provider);
}

const signOut = () => {
    return firebaseSignOut(auth);
}

export { auth, signInWithGoogle, signOut };
