// Import a helper function that generates fake restaurant and review data
import { generateFakeRestaurantsAndReviews } from "@/src/lib/fakeRestaurants.js";

// Import Firestore functions needed for reading, writing, and listening to data
import {
  collection,
  onSnapshot,
  query,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  orderBy,
  Timestamp,
  runTransaction,
  where,
  addDoc,
  getFirestore,
} from "firebase/firestore";

// import the initialized Firestore database instance
import { db } from "@/src/lib/firebase/clientApp";

// thisd updates the image URL for a specific restaurant document
export async function updateRestaurantImageReference(
  restaurantId,
  publicImageUrl
) {
  // create a reference to the restaurant document inside the "restaurants" collection
  const restaurantRef = doc(collection(db, "restaurants"), restaurantId);
  // if the document reference exists, update the "photo" field with the new image URL
  if (restaurantRef) {
    await updateDoc(restaurantRef, { photo: publicImageUrl });
  }
}

// a function to handle rating updates in a transaction - placeholder
const updateWithRating = async (
  transaction,
  docRef,
  newRatingDocument,
  review
) => {
  const restaurant = await transaction.get(docRef);
  const data = restaurant.data();
  const newNumRatings = data?.numRatings ? data.numRatings + 1 : 1;
  const newSumRating = (data?.sumRating || 0) + Number(review.rating);
  const newAverage = newSumRating / newNumRatings;

  transaction.update(docRef, {
    numRatings: newNumRatings,
    sumRating: newSumRating,
    avgRating: newAverage,
  });

  transaction.set(newRatingDocument, {
    ...review,
    timestamp: Timestamp.fromDate(new Date()),
  });
};

// a function for adding a review to a restaurant - placeholder
export async function addReviewToRestaurant(db, restaurantId, review) {
        if (!restaurantId) {
                throw new Error("No restaurant ID has been provided.");
        }

        if (!review) {
                throw new Error("A valid review has not been provided.");
        }

        try {
                const docRef = doc(collection(db, "restaurants"), restaurantId);
                const newRatingDocument = doc(
                        collection(db, `restaurants/${restaurantId}/ratings`)
                );

                // corrected line
                await runTransaction(db, transaction =>
                        updateWithRating(transaction, docRef, newRatingDocument, review)
                );
        } catch (error) {
                console.error(
                        "There was an error adding the rating to the restaurant",
                        error
                );
                throw error;
        }
}
// Applies query filters based on category, city, price, and sort order
function applyQueryFilters(q, { category, city, price, sort }) {
  if (category) {
   // Filter by category field 
    q = query(q, where("category", "==", category));
  }
  if (city) {
    q = query(q, where("city", "==", city));
    // Filter by city field
  }
  if (price) {
    // Filter by price 
    q = query(q, where("price", "==", price.length));
  }
  if (sort === "Rating" || !sort) {
    // Default or "Rating" sort
    q = query(q, orderBy("avgRating", "desc"));
  } else if (sort === "Review") {
    q = query(q, orderBy("numRatings", "desc"));
  }
  return q; // Return the modified query
}

// this fetches all restaurants from Firestore
export async function getRestaurants(db = db, filters = {}) {
  // a query that targets the "restaurants" collection
  let q = query(collection(db, "restaurants"));

  // Apply any provided filters to the query
  q = applyQueryFilters(q, filters);
  // Execute the query and get the documents
  const results = await getDocs(q);
  return results.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
      // Only plain objects can be passed to Client Components from Server Components
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}

export function getRestaurantsSnapshot(cb, filters = {}) {
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  let q = query(collection(db, "restaurants"));
  q = applyQueryFilters(q, filters);

  return onSnapshot(q, (querySnapshot) => {
    const results = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,  // Include the document ID
        ...doc.data(), // Spread all other fields from the document
        // Convert Firestore Timestamp to a JavaScript Date for use in Client Components
        timestamp: doc.data().timestamp.toDate(),
      };
    });

    cb(results);
  });
}

  // fetches a single restaurant document by its ID
export async function getRestaurantById(db, restaurantId) {
  // validate that a valid ID was passed
  if (!restaurantId) {
    console.log("Error: Invalid ID received: ", restaurantId);
    return;
  }
  // reference the restaurant document in the "restaurants" collection
  const docRef = doc(db, "restaurants", restaurantId);
  // fetch the document snapshot from Firestore
  const docSnap = await getDoc(docRef);
  // return the document data, converting the timestamp to a Date
  return {
    ...docSnap.data(),
    timestamp: docSnap.data().timestamp.toDate(),
  };
}

// real-time updates to a specific restaurant - placeholder
export function getRestaurantSnapshotById(restaurantId, cb) {
  return;
}

// Fetches all reviews for a specific restaurant, ordered by newest first
export async function getReviewsByRestaurantId(db, restaurantId) {
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    return;
  }

  // a query for the "ratings" subcollection of the restaurant, also sorted by timestamp
  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
    orderBy("timestamp", "desc")
  );

  const results = await getDocs(q);
  return results.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
      // Only plain objects can be passed to Client Components from Server Components
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}

// sets up a real-time listener for reviews on a specific restaurant
export function getReviewsSnapshotByRestaurantId(restaurantId, cb) {
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    return;
  }

  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
    orderBy("timestamp", "desc")
  );
  // listen to the ratings collection in real time
  return onSnapshot(q, (querySnapshot) => {
    const results = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
        // Only plain objects can be passed to Client Components from Server Components
        timestamp: doc.data().timestamp.toDate(),
      };
    });
    // call the provided callback with the latest review data
    cb(results);
  });
}

// Adds fake restaurant and review data to Firestore
export async function addFakeRestaurantsAndReviews() {
  // generate an array of fake restaurant + review data objects
  const data = await generateFakeRestaurantsAndReviews();
  // loop over each fake restaurant and add it to Firestore
  for (const { restaurantData, ratingsData } of data) {
    try {
      // add the restaurant document to the "restaurants" collection
      const docRef = await addDoc(
        collection(db, "restaurants"),
        restaurantData
      );

      // add each associated rating to the "ratings" subcollection
      for (const ratingData of ratingsData) {
        await addDoc(
          collection(db, "restaurants", docRef.id, "ratings"),
          ratingData
        );
      }
    } catch (e) {
      // log any errors that occur while writing to Firestore
      console.log("There was an error adding the document");
      console.error("Error adding document: ", e);
    }
  }
}
