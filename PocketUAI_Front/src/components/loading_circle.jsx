import React from 'react';
import { CircularProgress, Box } from '@mui/material';

// A simple component to display a loading indicator while the page data is being fetched.
export default function LoadingCircle() {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }}
        >
            <CircularProgress />
        </Box>
    );
}