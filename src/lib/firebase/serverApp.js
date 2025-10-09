// enforces that this code can only be called on the server
// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#keeping-server-only-code-out-of-the-client-environment
import "server-only";

import { cookies } from "next/headers";
import { initializeServerApp, initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

// Returns an authenticated client SDK instance for use in Server Side Rendering
// and Static Site Generation
export async function getAuthenticatedAppForUser() {
  const authIdToken = (await cookies()).get("__session")?.value;

  // initialize a Firebase app instance that will run on the server
  const firebaseServerApp = initializeServerApp(
    // create a base Firebase app configuration using the client SDK
    initializeApp(),
    {
      // Pass the user's authentication ID token so the server app
      // can act on behalf of the authenticated user
      authIdToken,
    }
  );

  // get the Firebase Authentication instance associated with the initialized server app
  const auth = getAuth(firebaseServerApp);
  // wait until Firebase has finished initializing and the authentication state is ready
  await auth.authStateReady();
  // return an object containing the initialized Firebase app and the currently authenticated user
  return { firebaseServerApp, currentUser: auth.currentUser };
}
