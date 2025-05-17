// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, signOut, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDudXZn9HsOZTWlx0QyigqGntOTD6XLEJ8",
  authDomain: "purrmate-dff18.firebaseapp.com",
  projectId: "purrmate-dff18",
  storageBucket: "purrmate-dff18.firebasestorage.app",
  messagingSenderId: "813321716155",
  appId: "1:813321716155:web:6b0e84d88388795a46049e",
  measurementId: "G-CTTM7LQN5M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

const firestore = getFirestore(app);

// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");
  const authLink = document.getElementById('auth-link');
  
  // Sign Up Form Handler
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("signup-name").value;
      const email = document.getElementById("signup-email").value;
      const password = document.getElementById("signup-password").value;

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create user in Firestore
        await setDoc(doc(firestore, 'users', user.uid), {
          uid: user.uid,
          name: name,
          email: email,
          level: 0,
          timestamp: new Date()
        });

        // Send email verification
        await sendEmailVerification(user);

        Swal.fire({
          icon: 'success',
          title: 'Account Created!',
          text: `A verification email has been sent to ${email}. Please check your inbox.`
        }).then(() => {
          window.location.href = 'index.html';
        });

      } catch (error) {
        console.error('Registration Error:', error);
        
        // Detailed error handling
        let errorMessage = 'Sign Up Failed';
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Email is already registered';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email format';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak';
            break;
          default:
            errorMessage = error.message;
        }
        Swal.fire({
          icon: 'error',
          title: 'Sign Up Failed',
          text: errorMessage,
        });
      }
    });
  }

  // Login Form Handler
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        location.href = "index.html"; // Redirect to main page on successful login
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: error.message,
        });
      }
    });
  }

  // Authentication state change listener
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log("Pengguna sudah login dengan UID:", user.uid);

      // Update tampilan authLink berdasarkan status login
      authLink.href = "profile.html";
      authLink.innerHTML = `<img src="assets/PROFILE.png" width="35" height="35" alt="Profile">`;

      // Jika halaman adalah profile.html, ambil data pengguna dari Firestore
      if (window.location.pathname.includes("profile.html")) {
        const userRef = doc(firestore, "users", user.uid);  // Ambil dokumen berdasarkan UID
        try {
          const userSnap = await getDoc(userRef);  // Ambil data dokumen
          if (userSnap.exists()) {
            const userData = userSnap.data();  // Ambil data dari dokumen Firestore
            console.log("Data pengguna ditemukan:", userData);

            // Update elemen HTML dengan data pengguna
            document.getElementById("user-name").textContent = userData.name || "Nama tidak tersedia";
            document.getElementById("user-email").textContent = userData.email || "Email tidak tersedia";
            document.getElementById("user-level").textContent = `Level ${userData.level || 0}`;
          } else {
            console.log("Dokumen pengguna tidak ditemukan.");
          }
        } catch (error) {
          console.error("Gagal mengambil data pengguna:", error);
        }
      }
    } else {
      console.log("Pengguna belum login");
      authLink.href = "Autentikasi.html";
      authLink.innerHTML = '<img src="assets/ButtonLogin.png" width="200" height="32" alt="Login">';
    }
  });

  // Logout Functionality
  const logoutButton = document.getElementById("logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      console.log("Logout button clicked");

      try {
        await signOut(auth);  
        console.log("Berhasil logout");
        window.location.href = "index.html";  
      } catch (error) {
        console.error("Gagal logout:", error);  
      }
    });
  }
});