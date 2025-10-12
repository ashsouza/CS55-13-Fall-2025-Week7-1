import { gemini20Flash, googleAI } from "@genkit-ai/googleai"; // imports the gemini model and google ai plugin from genkit-ai
import { genkit } from "genkit"; // imports the genkit function used to configure ai models
import { getReviewsByRestaurantId } from "@/src/lib/firebase/firestore.js"; // imports a function to get all reviews for a specific restaurant from firestore
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp"; // imports a function to get a firebase app authenticated for the user
import { getFirestore } from "firebase/firestore"; // imports the firestore instance from firebase

// defines an async component that generates a review summary using gemini
export async function GeminiSummary({ restaurantId }) {
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  // gets the authenticated firebase app for the current user
  const reviews = await getReviewsByRestaurantId(
    getFirestore(firebaseServerApp),
    restaurantId
  );
  // fetches all reviews from firestore for the given restaurant

  const reviewSeparator = "@";
  // sets a symbol to separate each review in the text
  const prompt = `
    Based on the following restaurant reviews, 
    where each review is separated by a '${reviewSeparator}' character, 
    create a one-sentence summary of what people think of the restaurant. 

    Here are the reviews: ${reviews.map((review) => review.text).join(reviewSeparator)}
  `;
// builds the ai prompt by combining all review texts with separators

  try {
    if (!process.env.GEMINI_API_KEY) {
      // checks if the gemini api key is set in environment variables
      // Make sure GEMINI_API_KEY environment variable is set:
      // https://firebase.google.com/docs/genkit/get-started
      throw new Error(
        'GEMINI_API_KEY not set. Set it with "firebase apphosting:secrets:set GEMINI_API_KEY"'
        // throws an error if no api key is found
      );
    }

    // configures a genkit instance using google ai and gemini model
    const ai = genkit({
      plugins: [googleAI()],
      model: gemini20Flash, // sets gemini 2.0 flash as the default model
    });
    const { text } = await ai.generate(prompt);
    // sends the prompt to the ai model and waits for the summary response

    return (
      <div className="restaurant__review_summary">
        <p>{text}</p>
        {/* displays the ai-generated summary text */}
        <p>✨ Summarized with Gemini</p>
        {/* adds a small note showing the summary source */}
      </div>
    );
  } catch (e) {
    console.error(e);
    // logs any error that happens during the ai generation
    return <p>Error summarizing reviews.</p>;
    // returns an error message if summarization fails
  }
}

// defines a loading placeholder component while ai summary is being generated
export function GeminiSummarySkeleton() {
  return (
    <div className="restaurant__review_summary">
      <p>✨ Summarizing reviews with Gemini...</p>
    </div>
  );
}
