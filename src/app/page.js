import RestaurantListings from "@/src/components/RestaurantListings.jsx"; // Imports the client component for displaying restaurants
import { getRestaurants } from "@/src/lib/firebase/firestore.js"; // Imports the server-side function to fetch restaurant data from Firestore
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js"; // Imports the function to get an authenticated Firebase app instance on the server
import { getFirestore } from "firebase/firestore"; // Imports the function to initialize the Firestore database instance

// force next.js to treat this route as server-side rendered
export const dynamic = "force-dynamic";


// defines the main Home component, which runs on the server
export default async function Home(props) {
  const searchParams = await props.searchParams;
  // Accesses URL query parameters (e.g., ?city=London) for server-side filtering

  // authenticate App on Server
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  // fetch Data: Calls the getRestaurants function
  const restaurants = await getRestaurants(
    getFirestore(firebaseServerApp), // gets the Firestore instance using the authenticated server app
    searchParams // passes the search parameters for server-side filtering
  );
  // render: Passes the fetched data and search parameters
  return (
    // this defines the main content area with a CSS class
    <main className="main__home">
      <RestaurantListings
        initialRestaurants={restaurants} // passes the fetched restaurant data
        searchParams={searchParams} // passes the initial search parameters
      />
    </main>
  );
}
