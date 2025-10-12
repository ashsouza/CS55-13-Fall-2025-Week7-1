"use client";
// tells next.js this component should run on the client side

// This components handles the review dialog and uses a next.js feature known as Server Actions to handle the form submission

// imports react hooks and other needed components
import { useEffect, useLayoutEffect, useRef } from "react";
import RatingPicker from "@/src/components/RatingPicker.jsx";
import { handleReviewFormSubmission } from "@/src/app/actions.js";

// defines the review dialog component and destructures its props
const ReviewDialog = ({
  isOpen,
  handleClose,
  review,
  onChange,
  userId,
  id,
}) => {
  const dialog = useRef();
  // creates a reference to the dialog element

  // dialogs only render their backdrop when called with `showModal`
  // handles showing or closing the dialog depending on state
  useLayoutEffect(() => {
    if (isOpen) {
      dialog.current.showModal();
      // shows the dialog with a backdrop
    } else {
      dialog.current.close();
      // closes the dialog when not open
    }
  }, [isOpen, dialog]);
  // runs whenever isOpen or dialog changes

  const handleClick = (e) => {
    // close if clicked outside the modal
    // checks if the user clicked outside the dialog
    if (e.target === dialog.current) {
      handleClose();
      // closes the dialog if clicked outside
    }
  };

  // renders the dialog element
  return (
    <dialog ref={dialog} onMouseDown={handleClick}>
      {/* form handles submission using next.js server actions */}
      <form
        action={handleReviewFormSubmission}
        onSubmit={() => {
          handleClose();
           // closes the dialog when form is submitted
        }}
      >
        <header>
          <h3>Add your review</h3>
          {/* heading for the form */}
        </header>
        <article>
          <RatingPicker />
          {/* includes the rating picker component */}

          <p>
            <input
              type="text"
              name="text"
              id="review"
              placeholder="Write your thoughts here"
              required
              value={review.text}
              onChange={(e) => onChange(e.target.value, "text")}
              // updates review text as user types
            />
          </p>

          <input type="hidden" name="restaurantId" value={id} />
          {/* hidden field for restaurant id */}
          <input type="hidden" name="userId" value={userId} />
          {/* hidden field for user id */}
        </article>
        <footer>
          <menu>
            <button
              autoFocus
              type="reset"
              onClick={handleClose}
              className="button--cancel"
            >
              Cancel
              {/* button to cancel and close the form */}
            </button>
            <button type="submit" value="confirm" className="button--confirm">
              Submit
              {/* button to submit the form */}
            </button>
          </menu>
        </footer>
      </form>
    </dialog>
  );
};

// exports the component for use in other files
export default ReviewDialog;
