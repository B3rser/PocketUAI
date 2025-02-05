import React from 'react';
import { Box, Typography, LinearProgress, Card, CardContent } from '@mui/material';

export function ExpenseIncomeCard({ expenses, incomes }) {
    return (
        <div style={{ width: "600px" }}>
            {distributionCard({ data: expenses, title: "Expense Distribution" })}
            {distributionCard({ data: incomes, title: "Income Types" })}
        </div>
    );
}

function distributionCard({ data, title }) {
    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>
                {data.map((item, index) => (
                    <Box display="flex" alignItems="center" mb={2} key={index}>
                        <Typography variant="body1" style={{ width: '30%' }}>
                            {item.label}
                        </Typography>
                        <LinearProgress variant="determinate" value={item.value} style={{ width: '70%' }} sx={{
                            backgroundColor: 'rgba(62, 92, 118, .2)', '& .MuiLinearProgress-bar': {
                                backgroundColor: 'rgba(62, 92, 118, .8)'
                            }
                        }}
                        />
                    </Box>
                ))}
            </CardContent>
        </Card>
    );
}