import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText,} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export function HistoryProgress({ activities }) {
    return (
        <Box sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', width: '500px' }}>
            {/* <Typography variant="h6" sx={{ mb: 2 }}>
                Progress
            </Typography> */}

            <Box sx={{
                maxHeight: '250px', overflowY: 'auto',
                '&::-webkit-scrollbar': {
                    width: '8px', 
                },
                '&::-webkit-scrollbar-track': {
                    backgroundColor: '#f1f1f1', 
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#888', 
                    borderRadius: '10px', 
                },
                '&::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: '#555',
                },
            }}>
                <List>
                    {activities.map((activity) => (
                        <ListItem key={activity.id} sx={{ p: 1 }}>
                            <ListItemIcon>
                                <AddCircleOutlineIcon fontSize="large" />
                            </ListItemIcon>
                            <ListItemText
                                primary={`Added $${activity.amount} to your goal "${activity.goal}"`}
                                secondary={activity.date}
                            />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Box>
    );
}
