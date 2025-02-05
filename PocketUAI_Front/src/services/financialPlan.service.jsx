import axios from 'axios';

const API_URL = 'http://localhost:8000/core/api/financialPlan';

/**
 * FinancialPlanService class provides methods for managing financial plans.
 * It interacts with the backend API to perform CRUD operations on financial plans.
 */

class FinancialPlanService {
    /**
     * Creates an instance of FinancialPlanService.
     * 
     * @param {Object} parameters - Initialization parameters for the service.
     */
    constructor(parameters) {
        // Initialization code (if any) can be added here.
    }

    /**
     * Retrieves a financial plan by its ID from the backend API.
     * 
     * @param {string} planId - The unique identifier of the financial plan to be retrieved.
     * @returns {Object} Response data from the backend or an error message.
     */
    async getPlan(planId) {
        try {
            const response = await axios.post(`${API_URL}/${planId}/`, {}, { withCredentials: true });
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

    /**
     * Adds a new financial plan by sending the provided data to the backend API.
     * 
     * @param {Object} planData - An object containing the financial plan data to be added.
     * @returns {Object} Response data from the backend or an error message.
     */
    async addPlan(planData) {
        try {
            const response = await axios.post(`${API_URL}/`, planData, { withCredentials: true });
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

    /**
     * Updates an existing financial plan by sending the updated data to the backend API.
     * 
     * @param {string} planId - The unique identifier of the financial plan to be updated.
     * @param {Object} planData - An object containing the updated financial plan data.
     * @returns {Object} Response data from the backend or an error message.
     */
    async updatePlan(planId, planData) {
        try {
            const response = await axios.put(`${API_URL}/up/${planId}/`, planData, { withCredentials: true });
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

    /**
     * Deletes a financial plan by its ID from the backend API.
     * 
     * @param {string} planId - The unique identifier of the financial plan to be deleted.
     * @returns {Object} Response data from the backend or an error message.
     */
    async deletePlan(planId) {
        try {
            const response = await axios.delete(`${API_URL}/de/${planId}/`, {}, { withCredentials: true });
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
}

// Exporting an instance of the FinancialPlanService class for use in other parts of the application.
export const financialPlanService = new FinancialPlanService();
