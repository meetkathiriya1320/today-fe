"use client";

import { getRequest } from "../axiosClient";

/**
 * Fetch dashboard summary data
 * @param {Object} router - Next.js router instance
 * @returns {Promise<Object>} Dashboard data with business summary
 */
export const fetchDashboardData = async (router) => {
    try {
        const response = await getRequest("/dashboard", {}, router);

        if (response.successType) {
            return response.response.data;
        }

        throw new Error(response.message || "Failed to fetch dashboard data");
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        throw error;
    }
};

export default fetchDashboardData;