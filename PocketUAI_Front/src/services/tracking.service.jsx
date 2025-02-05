import axios from 'axios';

const API_URL = 'http://localhost:8000/core/api/tracking';

/**
 * TrackingService class manages tracking-related operations such as retrieving, adding,
 * updating, and deleting tracking data for users.
 */
class TrackingService {
    constructor(parameters) {
        // Constructor can be used for initializing parameters if needed
    }

    /**
     * Retrieves the tracking data for a specific user based on their user ID.
     * 
     * @param {string} userId - The ID of the user for whom to retrieve the tracking data.
     * @returns {Object} Response data containing the tracking information or an error message.
     */
    async getTracking(userId) {
        try {
            // Sends a POST request to retrieve the tracking data for the user.
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

    /**
     * Adds new tracking data for the user.
     * 
     * @param {Object} trackingData - The tracking data to be added.
     * @returns {Object} Response data containing the result of the operation or an error message.
     */
    async addTracking(trackingData) {
        try {
            // Sends a POST request to add new tracking data.
            const response = await axios.post(`${API_URL}/`, trackingData, { withCredentials: true });
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
     * Updates the existing tracking data based on the tracking ID.
     * 
     * @param {string} trackingId - The ID of the tracking data to be updated.
     * @param {Object} trackingData - The new tracking data.
     * @returns {Object} Response data containing the result of the update or an error message.
     */
    async updateTracking(trackingId, trackingData) {
        try {
            // Sends a PUT request to update the tracking data with the provided ID.
            const response = await axios.put(`${API_URL}/up/${trackingId}/`, trackingData, { withCredentials: true });
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
     * Deletes the tracking data based on the tracking ID.
     * 
     * @param {string} trackingId - The ID of the tracking data to be deleted.
     * @returns {Object} Response data containing the result of the deletion or an error message.
     */
    async deleteTracking(trackingId) {
        try {
            // Sends a DELETE request to remove the tracking data with the provided ID.
            const response = await axios.delete(`${API_URL}/de/${trackingId}/delete/`, { withCredentials: true });
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

// Exporting an instance of TrackingService for use in other parts of the application.
export const trackingService = new TrackingService();
