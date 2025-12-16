"use client";

import { Bell, ChevronDown, Menu, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getResponse, postResponse } from "@/lib/response";
import { getRequest } from "@/lib/axiosClient";
import { setUnreadCount, incrementUnreadCount } from "@/store/slices/notificationSlice";
import {
  clearCurrentUserCookie,
  getCurrentUserCookie,
} from "@/utils/cookieUtils";
import logo from "../../assets/logo.png";
import NotificationDrawer from "../NotificationDrawer";
import useSocket from "@/hooks/useSocket";

const AdminHeader = ({ setIsSidebarOpen, isSidebarOpen }) => {
  const dispatch = useDispatch();
  const unreadCount = useSelector((state) => state.notification.unreadCount);

  const socket = useSocket();
  const [openMenu, setOpenMenu] = useState(false);
  const [openNotificationDrawer, setOpenNotificationDrawer] = useState(false);
  const router = useRouter();
  const profileMenuRef = useRef(null);
  const drawerOpenRef = useRef(openNotificationDrawer);
  const user = getCurrentUserCookie() || {};
  const firstLetter = user?.first_name?.charAt(0)?.toUpperCase() || "A";

  // Logout function
  const handleLogout = async () => {
    try {
      await postResponse({
        apiEndPoint: "auth/logout",
        payload: {},
      });
      // Remove user cookie
      clearCurrentUserCookie();
      // Navigate to login page
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // keep ref updated when state changes
  useEffect(() => {
    drawerOpenRef.current = openNotificationDrawer;
  }, [openNotificationDrawer]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await getResponse({ apiEndPoint: "/notification/unread-count", navigate: router });

        if (response?.successType && response?.response?.data !== undefined) {
          dispatch(setUnreadCount(response.response.data));
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
        dispatch(setUnreadCount(0));
      }
    };

    fetchUnreadCount();
  }, [dispatch]);

  useEffect(() => {
    socket.on("receive-user-notification", (data) => {
      if (data.role.includes(user.role) && !drawerOpenRef.current) {
        console.log(user, data.data, "TTTTT")
        const new_data = data.data.find((item) => item.user_id === user.id)
        if (new_data) {
          dispatch(incrementUnreadCount());
        }
      }
    });
  }, [dispatch])


  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-100 fixed top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        {/* LEFT: Logo */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden p-2 rounded-lg border text-gray-600 hover:bg-gray-100"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-4">
          <Link href="/admin/dashboard">
            <Image src={logo} width={140} height={40} alt="Admin Logo" />
          </Link>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center space-x-6">
          {/* Notification */}
          <div className="relative cursor-pointer" onClick={() => setOpenNotificationDrawer(!openNotificationDrawer)}>
            <Bell className="w-6 h-6 text-gray-600 hover:text-[var(--color-secondary)] transition" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 text-xs bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-full font-semibold shadow">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setOpenMenu(!openMenu)}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <div className="w-10 h-10 bg-red-200 rounded-xl flex items-center justify-center text-red-700 font-bold border-2 border-red-300">
                {firstLetter || ""}
              </div>

              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900">
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-xs text-gray-500">Administrator</div>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-gray-600 transition ${openMenu ? "rotate-180" : ""
                  }`}
              />
            </button>

            {/* DROPDOWN */}
            <div
              className={`
                absolute right-0 w-48 bg-white shadow-lg border border-gray-100 rounded-lg overflow-hidden z-50 
                transition-all duration-200 origin-top
                ${openMenu
                  ? "opacity-100 scale-100 translate-y-2"
                  : "opacity-0 scale-95 pointer-events-none"
                }
              `}
            >
              <Link
                href="/admin/dashboard"
                className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium"
                onClick={() => setOpenMenu(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  setOpenMenu(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={openNotificationDrawer}
        onClose={() => setOpenNotificationDrawer(false)}
      />
    </header>
  );
};

export default AdminHeader;
