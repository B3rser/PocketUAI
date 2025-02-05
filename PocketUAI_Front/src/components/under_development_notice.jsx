import React from 'react';
import { Box, Typography, Button } from '@mui/material';

export function UnderDevelopmentNotice() {
  return (
    <Box
      sx={{
        border: '2px dashed #f44336',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#ffebee',
        textAlign: 'center',
        marginBottom: '16px',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
        Page Under Development
      </Typography>
      <Typography variant="body1" sx={{ color: '#d32f2f', marginBottom: '8px' }}>
        Thank you for your patience! We are working hard to improve your experience.
      </Typography>

      {/* <Button 
        variant="contained" 
        color="error" 
        onClick={() => alert('Thank you for your patience!')}
      >
        More info
      </Button> */}
    </Box>
  );
}
