import axios from 'axios';

const API_URL = 'http://localhost:8000/core/api/user';

/**
 * UserService class manages user-related operations such as retrieving and updating user data.
 */

class UserService {
    constructor(parameters) {
        // Constructor can be used for initializing parameters if needed
    }

    /**
     * Retrieves the user data based on the user ID.
     * 
     * @param {string} userId - The ID of the user to retrieve the data for.
     * @returns {Object} Response data containing the user information or an error message.
     */
    async getUser(userId) {
        try {
            // Sends a POST request to retrieve the user data for the provided user ID.
            const response = await axios.post(`${API_URL}/${userId}/`, {}, { withCredentials: true });
            return response.data;
        } catch (error) {
            // Handles network or API errors by returning an appropriate message.
            if (error.response) {
                return error.response.data;
            }
            return {
                status: "network_error",
                message: "A network error occurred. Please check your connection."
            };
        }
    }

    // async addUser(userData) {
    //     try {
    //         const response = await axios.post(`${API_URL}/`, userData);
    //         return response.data;
    //     } catch (error) {
    //         if (error.response) {
    //             return error.response.data;
    //         }
    //         return {
    //             status: "network_error",
    //             message: "A network error occurred. Please check your connection."
    //         };
    //     }
    // };


    /**
     * Updates the user data based on the user ID and new data.
     * 
     * @param {string} userId - The ID of the user to be updated.
     * @param {Object} userData - The new data to update the user with.
     * @returns {Object} Response data containing the result of the update or an error message.
     */
    async updateUser(userId, userData) {
        try {
            // Sends a PUT request to update the user data for the provided user ID.
            const response = await axios.put(`${API_URL}/up/${userId}/`, userData, { withCredentials: true });
            return response.data;
        } catch (error) {
            // Handles network or API errors by returning an appropriate message.
            if (error.response) {
                return error.response.data;
            }
            return {
                status: "network_error",
                message: "A network error occurred. Please check your connection."
            };
        }
    }

    // async deleteUser(userId) {
    //     try {
    //         const response = await axios.delete(`${API_URL}/${userId}/delete/`);
    //         return response.data;
    //     } catch (error) {
    //         if (error.response) {
    //             return error.response.data;
    //         }
    //         return {
    //             status: "network_error",
    //             message: "A network error occurred. Please check your connection."
    //         };
    //     }
    // };
}

// Exporting an instance of UserService for use in other parts of the application.
export const userService = new UserService();
