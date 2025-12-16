"use client";

import { getCurrentUserCookie } from "@/utils/cookieUtils";

/**
 * Custom hook to check if current user is admin
 * @returns {boolean} - True if user is admin, false otherwise
 */
export const useIsAdmin = () => {
    const user = getCurrentUserCookie();
    return user?.role === "admin";
};