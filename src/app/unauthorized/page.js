"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Shield, ArrowLeft, Home } from "lucide-react";
import Button from "@/components/button";
import { getCurrentUserCookie } from "@/utils/cookieUtils";

const UnauthorizedPage = () => {
  const router = useRouter();
  const user = getCurrentUserCookie();

  const handleGoBack = () => {
    if (user?.role === "business_owner") {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  const handleGoHome = () => {
    router.push("/login");
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-9rem)]  justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-[var(--color-secondary)] py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-6">
              <Shield className="h-6 w-6 text-red-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Unauthorized Access
            </h2>

            <p className="text-gray-600 mb-8">
              {user?.role === "business_owner"
                ? "Admin access only. This section is restricted to administrators only."
                : "You don't have permission to access this page. Please log in with proper credentials."}
            </p>

            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Access Restricted
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        This page requires administrator privileges.
                        {user?.role === "business_owner"
                          ? " Contact your system administrator for access."
                          : " Please contact support for assistance."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <Button
                  onClick={handleGoBack}
                  label="Go Back"
                  className="w-full bg-[var(--color-secondary)] hover:bg-opacity-90"
                />

                <button
                  onClick={handleGoHome}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
