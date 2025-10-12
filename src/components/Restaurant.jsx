"use client";
// this tells next.js this component runs on the client side

// This components shows one individual restaurant
// It receives data from src/app/restaurant/[id]/page.jsx

import { React, useState, useEffect, Suspense } from "react"; // imports react and needed hooks
import dynamic from "next/dynamic"; // imports next.js dynamic import function
import { getRestaurantSnapshotById } from "@/src/lib/firebase/firestore.js"; // imports function to get a real-time snapshot of a restaurant by id
import { useUser } from "@/src/lib/getUser"; // imports custom hook to get the current user
import RestaurantDetails from "@/src/components/RestaurantDetails.jsx"; // imports component that displays restaurant details
import { updateRestaurantImage } from "@/src/lib/firebase/storage.js"; // imports function to update restaurant image in firebase storage

// dynamically imports the review dialog component only when needed
const ReviewDialog = dynamic(() => import("@/src/components/ReviewDialog.jsx"));

// defines the main restaurant component and receives props
export default function Restaurant({
  id,
  initialRestaurant,
  initialUserId,
  children,
}) {
  const [restaurantDetails, setRestaurantDetails] = useState(initialRestaurant);
  // stores restaurant data and initializes it with the given value
  const [isOpen, setIsOpen] = useState(false);
  // keeps track of whether the review dialog is open

  // The only reason this component needs to know the user ID is to associate a review with the user, and to know whether to show the review dialog
  // gets the current user id or falls back to the initial one
  const userId = useUser()?.uid || initialUserId;
  const [review, setReview] = useState({
    rating: 0,
    text: "",
  });
  // stores the review input data

  const onChange = (value, name) => {
    setReview({ ...review, [name]: value });
    // updates the review state whenever a field changes
  };

  async function handleRestaurantImage(target) {
    // handles uploading a new restaurant image
    const image = target.files ? target.files[0] : null;
    // gets the selected file from the input
    if (!image) {
      return;
      // stops if no image was selected
    }

    const imageURL = await updateRestaurantImage(id, image);
    // uploads image and gets the new url
    setRestaurantDetails({ ...restaurantDetails, photo: imageURL });
    // updates restaurant details with new image
  }

  const handleClose = () => {
    setIsOpen(false);
    // closes the review dialog
    setReview({ rating: 0, text: "" });
    // resets the review form
  };

  useEffect(() => {
    // listens for updates to restaurant data in real-time
    return getRestaurantSnapshotById(id, (data) => {
      // updates restaurant details when data changes
      setRestaurantDetails(data);
    });
  }, [id]);
  // runs when the id changes

  // renders the restaurant details and review dialog
  return (
    <>
      <RestaurantDetails
        restaurant={restaurantDetails}
        userId={userId}
        handleRestaurantImage={handleRestaurantImage}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
      >
        {children}
        {/* passes any child components inside restaurant details */}
      </RestaurantDetails>
      {userId && (
        // only show the review dialog if a user is logged in
        <Suspense fallback={<p>Loading...</p>}>
          {/* shows a loading message while dialog is being loaded */}
          <ReviewDialog
            isOpen={isOpen}
            handleClose={handleClose}
            review={review}
            onChange={onChange}
            userId={userId}
            id={id}
          />
        </Suspense>
      )}
    </>
  );
}
