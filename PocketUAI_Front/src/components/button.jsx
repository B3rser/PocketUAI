import React from 'react';

const Button = ({ type, children }) => {
  return (
    <button type={type} className="submit-button">
      {children}
    </button>
  );
};

export default Button;
