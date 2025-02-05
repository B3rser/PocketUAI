import React, { useState } from 'react';
import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { IconButton } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import imagePath from '../assets/icon.png';
import { useAuth } from '../context/auth.context';

// NavBar Component - A navigation bar with dynamic visibility, login/logout options, and links to different routes
export function NavBar() {
    const [visible, setVisible] = useState(false); // State to toggle visibility of the navbar
    const { user, logout } = useAuth(); // Destructure user data and logout function from custom auth hook

    // Event handler to show the navbar when the mouse enters the area
    const handleMouseEnter = () => {
        setVisible(true); // Set visibility to true
    };

    // Event handler to hide the navbar when the mouse leaves the area
    const handleMouseLeave = () => {
        setVisible(false); // Set visibility to false
    };

    // Logout the user asynchronously
    const logoutUser = async () => {
        const result = await logout(); // Call the logout function
    };

    return (
        // Main box containing the navbar with mouse enter/leave events to control visibility
        <Box
            onMouseEnter={handleMouseEnter} // Trigger handleMouseEnter on mouse enter
            onMouseLeave={handleMouseLeave} // Trigger handleMouseLeave on mouse leave
            sx={{
                position: 'fixed', // Position navbar fixed at the top of the page
                display: 'flex', // Flexbox layout for content arrangement
                justifyContent: 'center', // Center the content horizontally
                top: 0, // Place navbar at the top of the page
                left: 0, // Align navbar to the left of the page
                right: 0, // Align navbar to the right of the page
                zIndex: 1000, // Ensure navbar appears above other elements
                transition: 'transform 0.3s ease', // Smooth transition for visibility changes
                transform: visible ? 'translateY(0)' : 'translateY(-80%)', // Slide the navbar into view or hide it
            }}
        >
            <AppBar position="static" sx={{ backgroundColor: 'white', width: "70%" }}>
                <Toolbar>
                    {/* Box containing navigation items */}
                    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'space-around' }}>
                        {/* Logo Icon */}
                        <IconButton component={Link} to="/home">
                            <img
                                src={imagePath} // Image source for the logo
                                alt="Custom Icon" // Alt text for the logo image
                                style={{ width: '40px', height: '40px' }} // Styling for the logo size
                            />
                        </IconButton>
                        {/* Navigation Button to 'Plan' */}
                        <Button component={Link} to="/plan"> Plan </Button>
                        
                        {/* User Profile and Login/Logout Options */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '10px',
                                backgroundColor: 'white',
                                justifyContent: 'space-between',
                            }}
                        >
                            {/* Display username if user is logged in */}
                            {user ? (
                                <Typography color="black" variant="body1">
                                    {user.name}
                                </Typography>
                            ) : null}

                            {/* Login/Logout Button */}
                            <IconButton
                                size="small"
                                sx={{ marginRight: '10px' }} // Spacing to the right
                                component={Link}
                                to={user ? "/home" : "/login"} // Navigate to 'home' if logged in, 'login' if not
                                onClick={user ? logoutUser : null} // Trigger logout if user is logged in
                            >
                                {/* Display Logout Icon if user is logged in, Login Icon if not */}
                                {user ? (
                                    <LogoutIcon sx={{ color: "#3E5C76" }} />
                                ) : (
                                    <LoginIcon sx={{ color: "#3E5C76" }} />
                                )}
                            </IconButton>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>
    );
}

