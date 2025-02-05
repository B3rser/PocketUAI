import React from "react";
import { Box, Typography, TextField } from '@mui/material';

export function NewPlanQuestion({ question, field, type, value, onChange }) {
    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                {question}
            </Typography>
            <TextField
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '20px',
                        backgroundColor: '#D6DEE6',
                        border: '0px',
                        width: '30%',
                        alignSelf: 'center',
                    },
                }}
                fullWidth
                value={value ?? ''}
                onChange={(e) => onChange(field, e.target.value, type)}
                variant="outlined"
                margin="normal"
                type={type || 'text'}
            />
        </Box>
    );
}