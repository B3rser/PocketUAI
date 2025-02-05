import { Card, CardContent, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ButtonAction } from "./button_action";
import { useAuth } from '../context/auth.context';

// A dictionary of error messages, each corresponding to a specific error type.
// Each message includes the title, button text, and redirect URL for the action.
const messages = {
    "load-error": {
        title: "Failed to Load Data", // Title shown for load errors
        buttonText: "Retry", // Button text for retrying the action
        redirect: "/", // The URL to redirect to when the button is clicked
    },
    "no_cookie": {
        title: "Login Required", // Title for cases when login is required
        buttonText: "Go to Login", // Button text to redirect to the login page
        redirect: "/login", // Redirect URL for login page
    },
    "not_found": {
        title: "Financial Plan Required", // Title shown when no financial plan is found
        buttonText: "Create Plan", // Button text to navigate to plan creation page
        redirect: "/newplan", // Redirect URL for plan creation page
    },
    "unauthorized": {
        title: "Login Required", // Title shown for unauthorized access
        buttonText: "Go to Login", // Button text for login redirection
        redirect: "/login", // Redirect URL for login page
    },
    "invalid_cookie": {
        title: "Login Required", // Title shown for invalid cookie errors
        buttonText: "Go to Login", // Button text for login redirection
        redirect: "/login", // Redirect URL for login page
    },
};

// ErrorMessage component to display error messages and actions
const ErrorMessage = ({ type, message }) => {
    const navigate = useNavigate(); // Hook to navigate programmatically
    const { setUser } = useAuth(); // Auth hook to manage user state
    const { title, buttonText, redirect } = messages[type] || messages["load-error"]; // Get message details based on the error type

    // If the error type is "unauthorized" or "invalid_cookie", clear the user data
    if (type === "unauthorized" || type === "invalid_cookie") {
        setUser(null); // Log out the user by setting user to null
    }

    return (
        <div className="flex justify-center items-center h-screen">
            {/* Card to display the error message */}
            <Card sx={{ maxWidth: 500, p: 3, textAlign: "center" }}>
                <CardContent>
                    {/* Title of the error message */}
                    <Typography variant="h1" sx={{ fontSize: "2rem", mb: 2 }} gutterBottom>
                        {title}
                    </Typography>
                    {/* Body text of the error message */}
                    <Typography variant="body1" sx={{ fontSize: "1.5rem", mb: 4 }}>
                        {message}
                    </Typography>
                    {/* Button to perform the action (retry or redirect to login/plan creation) */}
                    <ButtonAction
                        onClick={() => navigate(redirect)} // Redirect to the specified URL
                        sx={{
                            width: '75%', // Set the button width
                        }}
                    >
                        {buttonText} {/* Display the button text */}
                    </ButtonAction>
                </CardContent>
            </Card>
        </div>
    );
};

// Export the ErrorMessage component for use in other parts of the application
export default ErrorMessage;
