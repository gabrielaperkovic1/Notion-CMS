import "./firebase_settings.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
const auth = getAuth();

import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import{ getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js"
const db = getFirestore();

async function signup() {
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const nickname = document.getElementById("nickname").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userData = {
            email: email,
            firstName: firstName,
            lastName: lastName,
            nickname: nickname
        };

        await setDoc(doc(db, "users", user.uid), userData);

    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
    }
}


async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
    }
}

function logout() {
    signOut(auth);
}

function isLoggedIn(user) {
    if (user) {
        document.getElementById("adminPanel").hidden = false;
        document.getElementById("loginForm").hidden = true;
        document.getElementById("signupForm").hidden = true;
    } else {
        document.getElementById("adminPanel").hidden = true;
        document.getElementById("loginForm").hidden = false;
        document.getElementById("signupForm").hidden = false;
    }
}

onAuthStateChanged(auth, isLoggedIn);

window.login = login;
window.logout = logout;
window.signup = signup;