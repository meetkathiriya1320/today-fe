"use client";

import { Toaster } from "react-hot-toast";
import Header from "@/components/header";
import { Suspense, useEffect, useLayoutEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUserCookie } from "@/utils/cookieUtils";
import LoadingSpinner from "@/components/loadingSpinner";
import Footer from "@/components/footer";
import Breadcrumb from "@/components/breadcrumb";
import { House } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setBreeadCrumb } from "@/store/slices/userSlice";
// import { Inter } from "next/font/google";

// const geistSans = Inter({
//   variable: "--font-inter",
//   subsets: ["latin"],
// });



// Routes where header & padding should be hidden
const HIDE_UI_ROUTES = ["/login", "/sign-up", "/business-details", "/forgot-password", "/reset-password"];

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const breadcrumb_array = useSelector((state) => state.user.breadcrumArray);

  const dispatch = useDispatch()

  // Don't show header for admin routes (they have their own layout)
  const hideUI =
    HIDE_UI_ROUTES.includes(pathname) || pathname.startsWith("/admin");

  useEffect(() => {
    const checkAuth = () => {
      const user = getCurrentUserCookie();

      // Allow access to public routes without authentication
      const publicRoutes = ["/login", "/sign-up", "/forgot-password", "/reset-password", "/business-details", "/", "/about-us", "/terms-and-conditions", "/privacy-policy", "/contact-us", "/categories"];
      if (publicRoutes.includes(pathname) || pathname.startsWith("/admin") || pathname.split("/").includes("user")) {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      if (!user) {
        router.push("/unauthorized");
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();

  }, [pathname, router]);

  useLayoutEffect(() => {
    dispatch(setBreeadCrumb([]))
  }, [pathname]);

  // Show loading state while checking authentication
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

  // path wise breadcrumb data
  const path_wise_breadcrumb = {
    "/home": [
      { icon: "House", name: "Home" }
    ]
    ,
    "/categories": [
      { icon: "House", name: "Home", navigation: "/home" },
      { name: "Categories" },
    ]
  }

  return (
    <div>
      {/* Sticky Header */}
      {!hideUI && (
        <header className="fixed w-[100vw] top-0 z-50">
          <Header />
        </header>
      )}

      {/* Page wrapper */}
      <div className="min-h-screen flex flex-col">

        {/* SHIFT CONTENT BELOW HEADER */}
        <div className={`${!hideUI ? `${!getCurrentUserCookie() ? "mt-[120px] md:mt-[134px] lg:mt-[87px]" : "mt-[70px] md:mt-[80px]"}` : ""} flex-grow`}>

          {/* Breadcrumb */}
          {/* {breadcrumb_array.length > 0 && <Breadcrumb
            items={breadcrumb_array}
          />} */}

          {/* Main content */}
          <main className={`bg-gradient-to-r from-[#DAF1ED] via-[#F1FAF8] to-[#F1FAF6] ${!hideUI && 'p-2 sm:p-8'} `}>
            <Suspense>{children}</Suspense>
          </main>

        </div>

        {/* Footer */}
        {!hideUI && <Footer />}

      </div>

      <Toaster position="top-right" />
    </div>

  );
}
