import React, { useState } from 'react';
import Input from '../components/inputField';  // Reusable input component for form fields  
import { authService } from "../services/auth.service";  // Service for handling authentication-related requests  
import { useNavigate, Link } from 'react-router-dom';  // Hook for navigation between routes  
import toast from 'react-hot-toast';  // Library to display toast notifications  

// Signup component that allows users to create a new account  
export const SignUp = () => {
  // Set the document title when the component mounts  
  React.useEffect(() => {
    document.title = 'Signup';
  }, []);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const nav = useNavigate();  // Hook to navigate users upon successful registration  

  // Local state to handle form data for registration  
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
  });

  // Function to update form state when input fields change  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Function to handle form submission  
  const handleSubmit = async (e) => {
    setIsSubmitting(true);
    try {
      e.preventDefault();  // Prevent the default form submission behavior  
      const response = await authService.signup_user({
        name: formData.name,
        last: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      if (response.status === "success") {
        toast.success(response.message);  // Show success toast notification  
        nav("/login");  // Navigate to the login page upon successful registration  
      } else {
        toast.error(response.message);  // Show error toast notification  
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Input field for the user's first name */}
      <Input label="Nombre" type="text" name="name" value={formData.name} onChange={handleChange} />

      {/* Input field for the user's last name */}
      <Input label="Apellido" type="text" name="lastName" value={formData.lastName} onChange={handleChange} />

      {/* Input field for the user's email */}
      <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} />

      {/* Input field for the user's password */}
      <Input label="Contraseña" type="password" name="password" value={formData.password} onChange={handleChange} />

      {/* Submit button for the form */}
      <button type="submit" disabled={isSubmitting}>SignUp</button>
      <p>Have an account? <Link to="/login">Log in here</Link></p>
    </form>
  );
};
