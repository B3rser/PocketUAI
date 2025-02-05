import { Button, styled } from '@mui/material';

// Styled Button (BtnPlan) Component
export const ButtonAction = styled(Button)({
    borderRadius: "15px", // Rounded corners
    color: "white", // White text color
    backgroundColor: "#0D1321", // Initial background color
    margin: 10, // Margin around the button
    fontSize: '1.3rem', // Font size for the button text
    textTransform: 'none', // Disable text transformation (uppercase/lowercase)
    width: "20%", // Set the button width to 20% of its parent container
    '&:hover': { // Apply hover effects
        backgroundColor: "#1B263B", // Change background color on hover
        boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)", // Add shadow on hover
    },
    '&.Mui-disabled': { // Styles for the disabled button
        backgroundColor: "#A5A5A5", // Set background color when disabled
        color: "#FFFFFF", // Set text color when disabled
        opacity: 0.7, // Reduce opacity when disabled
        cursor: 'not-allowed' // Change cursor to 'not-allowed'
    },
});