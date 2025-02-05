import React from "react";
import { Card, CardContent, Typography, IconButton, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

// ExpenseCard Component - Displays expense data for a specific month, including individual values and total.
const ExpenseCard = ({ data, onDelete }) => {

  // Helper function to calculate the total of all values in the 'data.values' object
  const calculateTotal = () => {
    return Object.values(data.values).reduce((acc, val) => acc + (parseInt(val) || 0), 0);
  };

  return (
    <Card
      sx={{
        width: 300, // Set card width
        margin: "auto", // Center the card horizontally
        borderRadius: 4, // Round the corners of the card
        boxShadow: 3, // Add shadow to the card for elevation
        position: "relative", // Set the position for the delete button
        overflow: "hidden", // Hide overflowing elements (delete button is outside card)
        background: "linear-gradient(135deg, #D6DEE6, #dce6f9)", // Gradient background color
      }}
    >
      {/* Header Section: Displays the month of the expenses */}
      <Box
        sx={{
          bgcolor: "#3E5C76", // Background color for the header
          color: "white", // Text color
          textAlign: "center", // Center the text
          py: 1, // Vertical padding
        }}
      >
        <Typography variant="h6">{data.month_name}</Typography>
      </Box>

      {/* Content Section: Displays each expense item and its value */}
      <CardContent sx={{ padding: 2 }}>
        {Object.entries(data.values).map(([key, value]) => (
          <Box
            key={key} // Unique key for each entry
            sx={{
              display: "flex", // Use flexbox layout for the entries
              justifyContent: "space-between", // Space between label and value
              mb: 1, // Margin bottom between items
              borderBottom: "1px solid #3E5C76", // Border to separate entries
              pb: 0.5, // Padding bottom for spacing
            }}
          >
            {/* Label of the expense item */}
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Typography>
            {/* Value of the expense item */}
            <Typography variant="body2">${value}</Typography>
          </Box>
        ))}

        {/* Total Section: Displays the total of all expenses */}
        <Box
          sx={{
            display: "flex", // Flexbox for the total section
            justifyContent: "space-between", // Space between label and value
            mt: 2, // Margin top for spacing
            pt: 1, // Padding top for spacing
            borderTop: "1px solid #3E5C76", // Border top to separate from the total
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            Total
          </Typography>
          <Typography variant="body2">${calculateTotal()}</Typography>
        </Box>

        {
          // Delete Button: Only allows removing the card if it's not the starting month (month 0)
          data.month != 0 ? (
            <IconButton
              color="error" // Red color for the delete button
              onClick={onDelete} // Callback function for delete action
              sx={{
                position: "absolute", // Absolute positioning for top-right placement
                top: 8, // Top margin
                right: 8, // Right margin
                bgcolor: "rgba(255, 255, 255, 0.8)", // Background color with transparency
                boxShadow: 1, // Light shadow around the button
                "&:hover": {
                  bgcolor: "rgba(255, 0, 0, 0.2)", // Change background on hover to a light red
                },
              }}
            >
              {/* Delete Icon inside the button */}
              <DeleteIcon />
            </IconButton>
          ) : null
        }
      </CardContent>
    </Card>
  );
};

export default ExpenseCard;
