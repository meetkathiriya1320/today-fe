"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserCookie } from "@/utils/cookieUtils";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import LoadingSpinner from "@/components/loadingSpinner";

const AdminLayout = ({ children }) => {
  const sidebarRef = useRef(null);
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        isSidebarOpen
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  useEffect(() => {
    const checkAuth = () => {
      const user = getCurrentUserCookie();

      if (!user) {
        router.push("/unauthorized");
        return;
      }

      if (user.role !== "admin") {
        router.push("/unauthorized");
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  // Don't render content if not authorized (will redirect)
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const sidebar_width = "256px";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header - Always visible */}
      <AdminHeader
        setIsSidebarOpen={setIsSidebarOpen}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Admin Layout Container */}
      <div className="flex">
        {/* Admin Sidebar - Fixed position */}
        <AdminSidebar
          ref={sidebarRef}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* Main Content Area - Takes remaining space */}
        <main
          className={`flex-1 mt-[75px]  ml-0 md:ml-64  overflow-auto w-calc(100vw - ${sidebar_width}`}
        >
          <div className="p-6">
            <div className="bg-white rounded-lg min-h-[calc(100vh-8rem)]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
