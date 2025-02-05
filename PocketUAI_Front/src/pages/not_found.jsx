import React from "react";  
import { useNavigate } from "react-router-dom";  // Hook for programmatic navigation  
import { Box, Typography } from "@mui/material";  // Material UI components for layout and typography  
import { ButtonAction } from "../components/button_action";  // Custom button component  

// Component for displaying a 404 Page Not Found error  
export const NotFound = () => {
  const navigate = useNavigate();  // Hook to navigate users back to a different page  

  // Function to redirect the user to the homepage  
  const goToHome = () => {
    navigate("/");  // Navigate to the home route  
  };

  return (
    <Box
      sx={{
        textAlign: "center",
        padding: "50px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        backgroundColor: "#f8f9fa",  // Light background color for a clean UI
      }}
    >
      {/* Main title for the 404 error page */}
      <Typography variant="h1" sx={{ fontSize: "3rem", color: "#ff4f4f", mb: 2 }}>
        404 - Page Not Found
      </Typography>

      {/* Message to inform the user about the error */}
      <Typography variant="body1" sx={{ fontSize: "1.5rem", mb: 4 }}>
        Sorry, the page you are looking for does not exist.
      </Typography>

      {/* Custom button to navigate back to the homepage */}
      <ButtonAction
        onClick={goToHome}
        sx={{
          width: '50%',
        }}
      >
        Go back to Home
      </ButtonAction>
    </Box>
  );
};
