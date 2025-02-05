import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, setPersistence, inMemoryPersistence } from "firebase/auth";

/**
 * Firebase configuration object containing keys and identifiers for connecting
 * to the Firebase service. These values are retrieved from environment variables.
 */
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase application with the provided configuration.
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication service.
const auth = getAuth(app);

// Set the authentication persistence to in-memory, meaning the session will not persist across page reloads.
await setPersistence(auth, inMemoryPersistence);

/**
 * Handles user login by verifying the credentials (email and password) 
 * using Firebase Authentication's signInWithEmailAndPassword method.
 * 
 * @param {Object} userData - The user credentials (email and password) to be used for login.
 * @param {string} userData.email - The user's email address.
 * @param {string} userData.password - The user's password.
 * @returns {Object} Response containing status and message, and user data if successful.
 */
export async function login(userData) {
    const email = userData["email"];
    const password = userData["password"];

    try {
        // Attempt to sign in with the provided email and password.
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Return success status along with the user data.
        return {
            status: "success",
            message: "Login successfully",
            user: user
        };
    } catch (error) {
        // Define default error message and type.
        let errorMessage = "An error occurred while logging in. Please try again later.";
        let errorType = "unknown";

        // Handle specific Firebase error codes for invalid credentials.
        if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
            errorMessage = "Incorrect email or password. Please verify your credentials and try again.";
            errorType = "invalid_credentials";
        }

        // Return error status and message.
        return {
            status: errorType,
            message: errorMessage
        };
    }
}
