import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// imports firebase storage functions for creating references, uploading files, and getting download urls

import { storage } from "@/src/lib/firebase/clientApp";
// imports the initialized firebase storage instance from the client app

import { updateRestaurantImageReference } from "@/src/lib/firebase/firestore";
// imports a function that updates the restaurant document with the new image url


// defines an async function to handle updating a restaurant image
export async function updateRestaurantImage(restaurantId, image) {
  try {
    if (!restaurantId) {
        // checks if a restaurant id was provided
      throw new Error("No restaurant ID has been provided.");
    }

    if (!image || !image.name) {
        // checks if a valid image file was provided
      throw new Error("A valid image has not been provided.");
    }

    const publicImageUrl = await uploadImage(restaurantId, image);
    // uploads the image and gets its public url
    await updateRestaurantImageReference(restaurantId, publicImageUrl);
    // updates the restaurant record in firestore with the new image url

    return publicImageUrl;
    // returns the public image url to the caller
  } catch (error) {
    console.error("Error processing request:", error);
    // logs any errors that occur during upload or firestore update
  }
}

// helper function to upload the image to firebase storage
async function uploadImage(restaurantId, image) {
  const filePath = `images/${restaurantId}/${image.name}`;
  // creates a file path in storage using the restaurant id and image name
  const newImageRef = ref(storage, filePath);
  // creates a reference to where the image will be stored
  await uploadBytesResumable(newImageRef, image);
  // uploads the image file to firebase storage

  return await getDownloadURL(newImageRef);
  // gets and returns the public download url of the uploaded image
}