import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { faMoneyBill } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export function GoalSummary({saved, goal, goal_name}) {
    const remaining = goal - saved;
    const progress = (saved / goal) * 100;

    return (
        <Box sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', width: '600px' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Goal Summary
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, border: '1px solid #e0e0e0', flex: 1, mr: 1 }}>
                    <Typography variant="subtitle1">Saved</Typography>
                    <Typography variant="h4" fontWeight="bold">${saved}</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, border: '1px solid #e0e0e0', flex: 1, ml: 1 }}>
                    <Typography variant="subtitle1">Remaining</Typography>
                    <Typography variant="h4" fontWeight="bold">${remaining.toLocaleString()}</Typography>
                </Box>
            </Box>

            <LinearProgress variant="determinate" value={progress} sx={{
                height: 10, borderRadius: 5, mb: 2, backgroundColor: 'rgba(62, 92, 118, .2)', '& .MuiLinearProgress-bar': {
                    backgroundColor: 'rgba(62, 92, 118, .8)'
                }
            }} />

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Box sx={{ display: 'inline-block', mr: 2 }}>
                    <FontAwesomeIcon size='2x' icon={faMoneyBill} />
                </Box>
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold">{goal_name}</Typography>
                    <Typography variant="body2" color="textSecondary">Goal: ${goal}</Typography>
                </Box>
            </Box>
        </Box>
    );
}