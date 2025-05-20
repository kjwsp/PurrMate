import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, signOut, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";

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

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      if (!isValidEmail(email)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Email',
          text: 'Please enter a valid email address.',
        });
        return;
      }

      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          console.log("Sign in successful for user:", user.email);
          Swal.fire({
            icon: 'success',
            title: 'Sign In Successful!',
            text: `Welcome back, ${user.email}!`,
          }).then(() => {
            console.log("Redirecting to home.html");
            window.location.href = 'home.html';
          });
        })
        .catch((error) => {
          console.error("Sign in error:", error);
          Swal.fire({
            icon: 'error',
            title: 'Sign In Failed',
            text: error.message,
          });
        });
    });
  }

  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const confirmPassword = document.getElementById('signup-confirm-password') ? document.getElementById('signup-confirm-password').value : null;

      if (confirmPassword !== null && password !== confirmPassword) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Passwords do not match.',
        });
        return;
      }

      createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;

          await setDoc(doc(firestore, 'users', user.uid), {
            uid: user.uid,
            name: name,
            email: email,
            HRV: 0
          });

          await sendEmailVerification(user);

          Swal.fire({
            icon: 'success',
            title: 'Sign Up Successful!',
            text: `A verification email has been sent to ${email}. Please check your inbox.`,
          }).then(() => {
            window.location.href = 'signin.html';
          });

          document.getElementById('signup-form').style.display = 'none';
        })
        .catch((error) => {
          let errorMessage = 'Sign Up Failed';
          switch (error.code) {
            case 'auth/email-already-in-use':
              errorMessage = 'Email is already registered';
              break;
            case 'auth/invalid-email':
              errorMessage = 'Invalid email format';
              break;
            default:
              errorMessage = error.message;
          }
          Swal.fire({
            icon: 'error',
            title: 'Sign Up Failed',
            text: errorMessage,
          });
        });
    });
  }

  const logoutButton = document.getElementById("logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      try {
        await signOut(auth);
        window.location.href = "index.html";
      } catch (error) {
        console.error("Logout failed:", error);
      }
    });
  }
});

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

// Listen for auth state changes and update profile page
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("User logged in with UID:", user.uid);
    if (window.location.pathname.includes("profile.html")) {
      const userRef = doc(firestore, "users", user.uid);
      try {
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          console.log("User data found:", userData);
          document.getElementById("user-name").textContent = userData.name || "Name not available";
          document.getElementById("user-email").textContent = userData.email || "Email not available";
          document.getElementById("profile-container").style.display = "flex";
          document.getElementById("auth-container").style.display = "none";
          document.getElementById("loading-container").style.display = "none";
        } else {
          console.log("User document not found.");
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    }
  } else {
    console.log("User not logged in");
    if (window.location.pathname.includes("profile.html")) {
      document.getElementById("profile-container").style.display = "none";
      document.getElementById("auth-container").style.display = "flex";
      document.getElementById("loading-container").style.display = "none";
    }
  }
});

// Logout button handler on profile page
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "index.html";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  });
}
