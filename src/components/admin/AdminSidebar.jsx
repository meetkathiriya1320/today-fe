"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Bell,
  Home,
  ShoppingBag,
  Users,
  BarChart3,
  Megaphone,
  Shield,
  FileText,
  CreditCard,
  MessageSquare,
  Flag,
  Settings,
} from "lucide-react";
import { getCurrentUserCookie } from "@/utils/cookieUtils";

const AdminSidebar = ({ isSidebarOpen, setIsSidebarOpen, ref }) => {
  const pathname = usePathname();
  const currentUser = getCurrentUserCookie();
  const isSuperAdmin = currentUser?.is_super_admin === true;

  const baseNavItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Home Banner",
      path: "/admin/home-banner",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      label: "Promotions",
      path: "/admin/promotions",
      icon: <Megaphone className="w-5 h-5" />,
    },
    {
      label: "Category",
      path: "/admin/category",
      icon: <Package className="w-5 h-5" />,
    },
    {
      label: "Offer Management",
      path: "/admin/offer-management",
      icon: <ShoppingBag className="w-5 h-5" />,
    },
    {
      label: "Offer Reported",
      path: "/admin/offer-reported",
      icon: <Flag className="w-5 h-5" />,
    },
    {
      label: "Shop",
      path: "/admin/shop",
      icon: <Home className="w-5 h-5" />,
    },
    {
      label: "Users",
      path: "/admin/user",
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: "Send Notification",
      path: "/admin/send-notification",
      icon: <Bell className="w-5 h-5" />,
    },
    {
      label: "Requests",
      path: "/admin/requests",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      label: "Payment",
      path: "/admin/payment",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      label: "Contact Us",
      path: "/admin/contact-us",
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      label: "Settings",
      path: "/admin/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  // Add Admin Management for super admins
  const navItems = isSuperAdmin
    ? [
        ...baseNavItems,
        {
          label: "Admin Management",
          path: "/admin/add-admin",
          icon: <Shield className="w-5 h-5" />,
        },
      ]
    : baseNavItems;

  return (
    <aside
      ref={ref}
      className={`
    fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg 
    border-r border-gray-200
    overflow-y-auto z-39 transition-transform duration-300
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0 
  `}
    >
      <div className="p-6 h-[85%] overflow-auto">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;

            return (
              <Link
                onClick={() => setIsSidebarOpen(false)}
                key={item.path}
                href={item.path}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? "bg-[#E6F2ED] text-[#377355] border-r-2 border-[#377355] font-medium"
                      : "text-gray-600 hover:bg-[#F3F7F5] hover:text-[#377355]"
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`${
                      isActive ? "text-[#377355]" : "text-gray-400"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>

                {item.badge && (
                  <span className="px-2 py-0.5 text-xs bg-[#D3E7DD] text-[#377355] rounded-full font-medium">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>Admin Panel v1.0</p>
          <p className="mt-1">© 2025 SchemeToday</p>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
