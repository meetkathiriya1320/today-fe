"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { getRequest } from "@/lib/axiosClient";
import { useRouter } from "next/navigation";
import { getResponse, patchResponse } from "@/lib/response";
import useSocket from "@/hooks/useSocket";
import { useDispatch } from "react-redux";
import { unreadCountUpdate } from "@/store/slices/notificationSlice";
import { getCurrentUserCookie } from "@/utils/cookieUtils";

const NotificationDrawer = ({ isOpen, onClose }) => {
  const router = useRouter();
  const socket = useSocket();
  const dispatch = useDispatch()
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = getCurrentUserCookie() || {};

  // Fetch notifications from API
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    socket.on("receive-user-notification", async (data) => {

      if (data.role.includes(user.role)) {
        const new_data = data.data.find((item) => item.user_id === user.id)
        if (new_data) {
          setNotifications(prev => [new_data, ...prev]);
          if (isOpen) {
            const payload = {
              id: [new_data.notification_id]
            }
            await patchResponse({ apiEndPoint: "/notification/read-notification", payload })
          }
        }

      }

    });
  }, [])

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await getResponse({ apiEndPoint: "/notification" });
      if (response?.successType && response?.response?.data) {
        // Filter for unread notifications (is_read = false)
        const unreadNotifications = response.response.data.filter(
          notification => notification.is_read === false
        );

        const unread_id = unreadNotifications.map(notification => notification.notification_id)
        const payload = {
          id: unread_id
        }
        if (unread_id.length) {
          await patchResponse({ apiEndPoint: "/notification/read-notification", payload })
          dispatch(unreadCountUpdate())
        }
        setNotifications(response.response.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-100 bg-white shadow-lg z-[70] transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto h-[90vh] p-4">
          {loading ? (
            <div className="text-center text-gray-500 py-8">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No notifications
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 cursor-pointer rounded-lg border ${notification.is_read === false
                    ? "bg-blue-50 border-blue-200"
                    : "bg-white border-gray-200"
                    }`}
                  onClick={() => {
                    if (notification.redirect_url) {
                      router.push(notification.redirect_url)
                      onClose()
                    }
                  }}
                >

                  {notification.Notification.image ? (
                    <div className="flex items-start space-x-3">
                      <img
                        src={notification.Notification.image}
                        alt="Notification"
                        width={40}
                        height={40}
                        className="rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.Notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.created_at ? new Date(notification.created_at).toLocaleString() : "Recently"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {notification.Notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.created_at ? new Date(notification.created_at).toLocaleString() : "Recently"}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationDrawer;