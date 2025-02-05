import React from 'react';
import { Button, Box , Typography } from '@mui/material';
import './expense_item.css'; 

export function ExpenseItem({ name, amount, icon }) {
    return (
      <Box className="expense-item-container">
        <div className="expense-icon">{icon}</div>
        <Typography variant="body1" className="expense-text">
          {name} ${amount}
        </Typography>
      </Box>
    );
  }
