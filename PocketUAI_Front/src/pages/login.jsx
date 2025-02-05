import React, { useState } from 'react';  
import Input from '../components/inputField';  // Reusable input component for form fields  
import { useNavigate } from 'react-router-dom';  // Hook for navigation between routes  
import { useAuth } from '../context/auth.context';  // Context for authentication management  

// Login component that allows users to authenticate  
const Login = () => {  
  // Set the document title when the component mounts  
  React.useEffect(() => {
    document.title = 'Login';
  }, []);

  const { login } = useAuth();  // Custom hook to access the login function  
  const nav = useNavigate();  // Hook to navigate users upon successful login  

  // Local state to handle form data for login  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Function to update form state when input fields change  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Function to handle form submission  
  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent the default form submission behavior  
    const response = await login(formData);  // Call the login method with form data  
    if (response.status === "success") {
      nav("/home");  // Navigate to the home page if login is successful  
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Input field for the email */}
      <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} />
      
      {/* Input field for the password */}
      <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} />
      
      {/* Submit button for the form */}
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;  // Export the component for use in other parts of the application
