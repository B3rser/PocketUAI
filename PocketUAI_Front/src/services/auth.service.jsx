import axios from 'axios';
import { login } from './firebase.service'

const API_URL = 'http://localhost:8000/core/api/auth';

/**
 * AuthService class provides methods for user authentication and session management.
 * It interacts with the backend API to handle user sign-up, login, session verification, 
 * and logout processes.
 */

class AuthService {
    constructor(parameters) {

    }

    async signup_user(userData) {
        try {
            const response = await axios.post(`${API_URL}/signup/`, userData);
            return response.data;
        } catch (error) {
            if (error.response) {
                return error.response.data;
            }
            return {
                status: "network_error",
                message: "A network error occurred. Please check your connection."
            };
        }
    };

    async login_user(userData) {
        try {
            const loginResponse = await login(userData);

            if (loginResponse.status !== "success") {
                return loginResponse;
            }

            const user = loginResponse.user;
            const idToken = await user.getIdToken();

            // Sends the idToken to the backend to log the user in.

            const response = await axios.post(`${API_URL}/login/`, { idToken }, { withCredentials: true, });

            return response.data;
        } catch (error) {
            if (error.response) {
                return error.response.data;
            }
            return {
                status: "network_error",
                message: "A network error occurred. Please check your connection."
            };
        }
    }

    /**
     * Verifies the user's session by checking the authentication cookie.
     * 
     * @returns {Object} Response data from the backend indicating session status.
     */

    async check_cookie_user() {
        try {
            const response = await axios.post(`${API_URL}/checkcookie/`, {}, { withCredentials: true, });
            return response.data;
        } catch (error) {
            if (error.response) {
                return error.response.data;
            }
            return {
                status: "network_error",
                message: "A network error occurred. Please check your connection."
            };
        }
    }

    /**
     * Logs out the user by sending a request to the backend API.
     * 
     * @returns {Object} Response data from the backend or an error message.
     */

    async logout_user() {
        try {
            const response = await axios.post(`${API_URL}/logout/`, {}, { withCredentials: true });
            return response.data;
        } catch (error) {
            if (error.response) {
                return error.response.data;
            }
            return {
                status: "network_error",
                message: "A network error occurred. Please check your connection."
            };
        }
    }
}

// Exporting an instance of the AuthService class for use in other parts of the application.
export const authService = new AuthService();