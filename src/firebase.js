// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore} from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAz41NuseKHRGWUwf-WWCn8wj9ZFdUyp6U",
    authDomain: "task-38555.firebaseapp.com",
    projectId: "task-38555",
    storageBucket: "task-38555.appspot.com",
    messagingSenderId: "691919723415",
    appId: "1:691919723415:web:d983bd19b92838b064c2d2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
export {  db,storage };