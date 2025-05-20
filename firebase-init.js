import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, signOut, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAwojaE5L4WuwtHRJ_xwaycuSmkGgAyZBI",
  authDomain: "purrmate-stress-manager.firebaseapp.com",
  databaseURL: "https://purrmate-stress-manager-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "purrmate-stress-manager",
  storageBucket: "purrmate-stress-manager.firebasestorage.app",
  messagingSenderId: "942490809737",
  appId: "1:942490809737:web:298894b7efc71538741d58",
  measurementId: "G-P6EGG0N18Z"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const database = getDatabase(app);

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
          await updateProfile(user, { displayName: name });
          const timestampMilliSeconds = Date.now();
          const timestampSeconds = Math.floor(timestampMilliSeconds / 1000);
          await set(ref(database, 'users/' + user.uid), {
            name: name,
            email: email,
            tempTime: timestampMilliSeconds,
            hrv: {
              [timestampSeconds]: {
                rmssd: "--",
                state: "-"
              }
            }
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

onAuthStateChanged(auth, async (user) => {
  if (user && window.location.pathname.includes("profile.html")) {
    const userRef = ref(database, "users/" + user.uid);
    console.log("Reading database at:", "users/" + user.uid);
  
    get(userRef)
      .then((snap) => {
        console.log("Got snapshot:", snap.val());
        if (!snap.exists()) {
          console.warn("No data under that node!");
          return;
        }
        const { name, email } = snap.val();
        document.getElementById("user-name").textContent  = name;
        document.getElementById("user-email").textContent = email;
  
        document.getElementById("profile-container").style.display = "flex";
        document.getElementById("auth-container").style.display    = "none";
      })
      .catch((err) => console.error(err))
      .finally(() => {
        document.getElementById("loading-container").style.display = "none";
      });
  }
});

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
