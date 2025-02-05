import axios from 'axios';

const API_URL = 'http://localhost:8000/core/api/history';

/**
 * HistoryService class handles interactions related to user history. 
 * It provides methods for retrieving, adding, updating, deleting, 
 * and deleting all history records for a specific user.
 */
class HistoryService {
    constructor(parameters) {
        // Constructor can be used for initializing parameters if needed
    }

    /**
     * Retrieves the history of a specific user.
     * 
     * @param {string} userId - The ID of the user whose history is to be fetched.
     * @returns {Object} Response data containing the user's history or an error message.
     */
    async getHistory(userId) {
        try {
            // Sends a POST request to fetch user history.
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
    };

    /**
     * Adds a new history record for the user.
     * 
     * @param {Object} historyData - The history data to be added.
     * @returns {Object} Response data with the result of the addition or an error message.
     */
    async addHistory(historyData) {
        try {
            // Sends a POST request to add a new history record.
            const response = await axios.post(`${API_URL}/`, historyData, { withCredentials: true });
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
    };

    /**
     * Updates an existing history record.
     * 
     * @param {string} historyId - The ID of the history record to be updated.
     * @param {Object} historyData - The updated history data.
     * @returns {Object} Response data with the result of the update or an error message.
     */
    async updateHistory(historyId, historyData) {
        try {
            // Sends a PUT request to update the history record.
            const response = await axios.put(`${API_URL}/up/${historyId}/`, historyData, { withCredentials: true });
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
    };

    /**
     * Deletes a specific history record.
     * 
     * @param {string} historyId - The ID of the history record to be deleted.
     * @returns {Object} Response data with the result of the deletion or an error message.
     */
    async deleteHistory(historyId) {
        try {
            // Sends a DELETE request to remove the history record.
            const response = await axios.delete(`${API_URL}/de/${historyId}/`, { withCredentials: true });
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
    };

    /**
     * Deletes all history records for a specific user.
     * 
     * @param {string} userId - The ID of the user whose history records are to be deleted.
     * @returns {Object} Response data with the result of the deletion or an error message.
     */
    async deleteAllHistory(userId) {
        try {
            // Sends a DELETE request to remove all history records for the user.
            const response = await axios.delete(`${API_URL}/deall/${userId}/`, { withCredentials: true });
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
    };
}

// Exporting an instance of HistoryService for use in other parts of the application.
export const historyService = new HistoryService();
