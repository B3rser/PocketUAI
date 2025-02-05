import React from 'react';
import { TextField } from '@mui/material';

const Input = ({ label, type, name, value, onChange }) => {
  return (
    <TextField
      label={label}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      fullWidth
      margin="normal"
      variant="outlined"
    />
  );
};

export default Input;