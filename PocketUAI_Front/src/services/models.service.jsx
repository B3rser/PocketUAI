import axios from 'axios';

const API_URL = 'http://localhost:8000/core/api/models';

/**
 * ModelsService class handles interactions related to models, such as 
 * creating new plans and retrieving regression points based on tracking data.
 */
class ModelsService {
    constructor(parameters) {
        // Constructor can be used for initializing parameters if needed
    }

    /**
     * Creates a new plan for the user based on the provided user data.
     * 
     * @param {Object} userData - The data for creating a new plan.
     * @returns {Object} Response data with the result of the creation or an error message.
     */
    async new_plan(userData) {
        try {
            // Sends a POST request to create a new plan for the user.
            const response = await axios.post(`${API_URL}/create_new_plan/`, userData, { withCredentials: true });
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

    /**
     * Retrieves the points used for regression based on the provided tracking data.
     * 
     * @param {Object} tracking - The tracking data used for regression.
     * @returns {Object} Response data containing the regression points or an error message.
     */
    async get_points_regression(tracking) {
        try {
            // Sends a POST request to fetch the regression points based on tracking data.
            const response = await axios.post(`${API_URL}/get_points_regression/`, tracking, { withCredentials: true });
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
}

// Exporting an instance of ModelsService for use in other parts of the application.
export const modelsService = new ModelsService();
