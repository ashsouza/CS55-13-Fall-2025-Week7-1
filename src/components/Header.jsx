"use client"; // marks this file as a Client Component in Next.js and runs in the browser
import React, { useEffect } from "react"; // Imports React and the useEffect hook for side effects (like listening to auth changes)
import Link from "next/link"; // Imports Next.js <Link> component for client-side navigation
import {
  signInWithGoogle,
  signOut,
  onIdTokenChanged,
} from "@/src/lib/firebase/auth.js"; // imports Firebase authentication helper functions from your custom auth module
import { addFakeRestaurantsAndReviews } from "@/src/lib/firebase/firestore.js"; // imports a helper function that adds sample restaurant data to Firestore
import { setCookie, deleteCookie } from "cookies-next"; // imports utilities to manage cookies (for saving/deleting session tokens)

// custom hook to manage the user's authentication session
function useUserSession(initialUser) {
  useEffect(() => {
    // start listening for changes in the user's ID token when the component mounts
    return onIdTokenChanged(async (user) => {
      if (user) {
        // If user is logged in, get their Firebase ID token
        const idToken = await user.getIdToken();
        // store the token in a cookie named "__session"
        await setCookie("__session", idToken);
      } else {
        // if user logs out, remove the session cookie
        await deleteCookie("__session");
      }
      // if new user is the same as the current one, no need to reload
      if (initialUser?.uid === user?.uid) {
        return;
      }
      // otherwise - reload the page to reflect the new auth state
      window.location.reload();
    });
  }, [initialUser]);
  // effect depends on the initial user (re-runs if it changes)

  return initialUser;
  // returns the initial user for use in the component
}

// header component — displays logo and user authentication controls
export default function Header({ initialUser }) {
  const user = useUserSession(initialUser);
// calls the custom hook to manage the current user session

  const handleSignOut = (event) => {
    event.preventDefault();
    signOut();
  };

  const handleSignIn = (event) => {
    // prevents the default link behavior
    event.preventDefault();
    signInWithGoogle();
    // calls Firebase signInWithGoogle to open the Google login popup
  };

  return (
    <header>
      <Link href="/" className="logo">
        <img src="/friendly-eats.svg" alt="FriendlyEats" />
        Friendly Eats
      </Link>
      {user ? (
        <>
          <div className="profile">
            <p>
              <img
                className="profileImage"
                src={user.photoURL || "/profile.svg"}
                alt={user.email}
              />
              {user.displayName}
            </p>

            <div className="menu">
              ...
              <ul>
                <li>{user.displayName}</li>

                <li>
                  <a href="#" onClick={addFakeRestaurantsAndReviews}>
                    Add sample restaurants
                  </a>
                </li>

                <li>
                  <a href="#" onClick={handleSignOut}>
                    Sign Out
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div className="profile">
          <a href="#" onClick={handleSignIn}>
            <img src="/profile.svg" alt="A placeholder user image" />
            Sign In with Google
          </a>
        </div>
      )}
    </header>
  );
}
