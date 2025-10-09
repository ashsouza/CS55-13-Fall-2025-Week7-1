// Import Firebase Authentication functions and classes
import {
  GoogleAuthProvider,  // creates a Google authentication provider instance
  signInWithPopup,  // opens a popup for Google sign-in
  onAuthStateChanged as _onAuthStateChanged, // a listener for changes in the user's authentication state (sign-in/sign-out)
  onIdTokenChanged as _onIdTokenChanged,  // a listener for changes in the user's ID token (used for session handling)
} from "firebase/auth";

// import the initialized Firebase Auth instance from your client configuration
import { auth } from "@/src/lib/firebase/clientApp";

// Wrapper function to listen for authentication state changes
export function onAuthStateChanged(cb) {
  // calls onAuthStateChanged with the app's auth instance and the provided callback
  return _onAuthStateChanged(auth, cb);
}

// a wrapper function to listen for ID token changes
export function onIdTokenChanged(cb) {
  // this calls onIdTokenChanged with the app's auth instance and the provided callback
  return _onIdTokenChanged(auth, cb);
}

// a function to sign in a user using Google Authentication
export async function signInWithGoogle() {
  // create a new Google authentication provider instance
  const provider = new GoogleAuthProvider();

  try {
    // opens a Google sign-in popup and authenticates the user
    await signInWithPopup(auth, provider);
  } catch (error) {
    // logs any errors during sign-in
    console.error("Error signing in with Google", error);
  }
}

// signs out the currently authenticated user
export async function signOut() {
  try {
    // this calls the signOut method to log the user out
    return auth.signOut();
  } catch (error) {
    // logs any errors that occur during sign-out
    console.error("Error signing out with Google", error);
  }
}