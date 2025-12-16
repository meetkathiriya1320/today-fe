"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Megaphone,
  DollarSign,
  Tag,
  Users,
  BarChart3,
  Shield,
  Image as ImageIcon,
  Eye,
} from "lucide-react";
import { getResponse } from "@/lib/response";

const AdminDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getResponse({
        apiEndPoint: "dashboard",
      });

      if (response.successType) {
        setDashboardData(response.response.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 text-lg">Welcome to the SchemeToday Admin Panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Offers */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-emerald-600 text-sm font-semibold uppercase tracking-wide">Offers</p>
              <div className="text-2xl font-bold text-emerald-900 mt-1">
                {loading ? (
                  <div className="animate-pulse bg-emerald-200 h-6 w-8 rounded"></div>
                ) : (
                  dashboardData?.["Total offers"] || 0
                )}
              </div>
            </div>
            <div className="bg-emerald-500 p-2 rounded-full">
              <Tag className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-emerald-700">Pending</span>
              <span className="text-sm font-semibold text-yellow-600">
                {loading ? "..." : dashboardData?.["Pending offers"] || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-emerald-700">Approved</span>
              <span className="text-sm font-semibold text-green-600">
                {loading ? "..." : dashboardData?.["Approved offers"] || 0}
              </span>
            </div>

          </div>
        </div>
        {/* Advertise */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-purple-600 text-sm font-semibold uppercase tracking-wide">Advertise</p>
              <div className="text-2xl font-bold text-purple-900 mt-1">
                {loading ? (
                  <div className="animate-pulse bg-purple-200 h-6 w-8 rounded"></div>
                ) : (
                  dashboardData?.["Total advertise requests"] || 0
                )}
              </div>
            </div>
            <div className="bg-purple-500 p-2 rounded-full">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="space-y-2">

            <div className="flex justify-between items-center">
              <span className="text-xs text-purple-700">Pending</span>
              <span className="text-sm font-semibold text-yellow-600">
                {loading ? "..." : dashboardData?.["Pending advertise requests"] || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-purple-700">Approved</span>
              <span className="text-sm font-semibold text-green-600">
                {loading ? "..." : dashboardData?.["Approved advertise requests"] || 0}
              </span>
            </div>

          </div>
        </div>

        {/* Users */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-green-600 text-sm font-semibold uppercase tracking-wide">Business Owner</p>
              <div className="text-2xl font-bold text-green-900 mt-1">
                {loading ? (
                  <div className="animate-pulse bg-green-200 h-6 w-8 rounded"></div>
                ) : (
                  dashboardData?.["Total business owners"] || 0
                )}
              </div>
            </div>
            <div className="bg-green-500 p-2 rounded-full">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="space-y-2">

            <div className="flex justify-between items-center">
              <span className="text-xs text-green-700">Active Owners</span>
              <span className="text-sm font-semibold text-blue-600">
                {loading ? "..." : dashboardData?.["Active business owners"] || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-green-700">Inactive Business Owners</span>
              <span className="text-sm font-semibold text-green-900">
                {loading ? "..." : dashboardData?.["Inactive business owners"] || 0}
              </span>
            </div>
          </div>
        </div>




        {/* Block Users */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-red-600 text-sm font-semibold uppercase tracking-wide">Block Users</p>
              <div className="text-2xl font-bold text-red-900 mt-1">
                {loading ? (
                  <div className="animate-pulse bg-red-200 h-6 w-8 rounded"></div>
                ) : (
                  dashboardData?.["Total blocked users"] || 0
                )}
              </div>
            </div>
            <div className="bg-red-500 p-2 rounded-full">
              <Shield className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-red-700">Pending Unblock</span>
              <span className="text-sm font-semibold text-orange-600">
                {loading ? "..." : dashboardData?.["Pending unblock requests"] || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide">Total Categories</p>
              <div className="text-3xl font-bold text-blue-900 mt-2">
                {loading ? (
                  <div className="animate-pulse bg-blue-200 h-8 w-8 rounded"></div>
                ) : (
                  dashboardData?.["Total categories"] || 0
                )}
              </div>
            </div>
            <div className="bg-blue-500 p-3 rounded-full">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Home Banners */}
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-6 border border-cyan-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-cyan-600 text-sm font-semibold uppercase tracking-wide">Home Banners</p>
              <div className="text-2xl font-bold text-cyan-900 mt-1">
                {loading ? (
                  <div className="animate-pulse bg-cyan-200 h-6 w-8 rounded"></div>
                ) : (
                  dashboardData?.["Total home banners"] || 0
                )}
              </div>
            </div>
            <div className="bg-cyan-500 p-2 rounded-full">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
          </div>

        </div>





        {/* Payments */}
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6 border border-teal-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-teal-600 text-sm font-semibold uppercase tracking-wide">Total Payment</p>
              <div className="text-3xl font-bold text-teal-900 mt-2">
                {loading ? (
                  <div className="animate-pulse bg-teal-200 h-8 w-16 rounded"></div>
                ) : (
                  `₹${dashboardData?.["Total payment amount"] || 0}`
                )}
              </div>
            </div>
            <div className="bg-teal-500 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-lg border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
          <BarChart3 className="w-6 h-6 text-slate-600 mr-2" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => router.push('/admin/category')}
            className="group p-5 text-left bg-white hover:bg-gray-50 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 border border-slate-200 hover:border-slate-300 cursor-pointer"
          >
            <Package className="w-7 h-7 text-blue-500 mb-3 transition-colors" />
            <p className="text-sm font-semibold text-slate-700">Add Category</p>
            <p className="text-xs text-slate-500 mt-1">Manage categories</p>
          </button>

          <button
            onClick={() => router.push('/admin/home-banner')}
            className="group p-5 text-left bg-white hover:bg-gray-50 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 border border-slate-200 hover:border-slate-300 cursor-pointer"
          >
            <ImageIcon className="w-7 h-7 text-green-500 mb-3 transition-colors" />
            <p className="text-sm font-semibold text-slate-700">Manage Banners</p>
            <p className="text-xs text-slate-500 mt-1">Home page banners</p>
          </button>

          <button
            onClick={() => router.push('/admin/requests')}
            className="group p-5 text-left bg-white hover:bg-gray-50 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 border border-slate-200 hover:border-slate-300 cursor-pointer"
          >
            <Shield className="w-7 h-7 text-purple-500 mb-3 transition-colors" />
            <p className="text-sm font-semibold text-slate-700">Block User Requests</p>
            <p className="text-xs text-slate-500 mt-1">User block requests</p>
          </button>

          <button
            onClick={() => router.push('/admin/offer-management')}
            className="group p-5 text-left bg-white hover:bg-gray-50 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 border border-slate-200 hover:border-slate-300 cursor-pointer"
          >
            <Tag className="w-7 h-7 text-emerald-500 mb-3 transition-colors" />
            <p className="text-sm font-semibold text-slate-700">Manage Offers</p>
            <p className="text-xs text-slate-500 mt-1">Create & edit offers</p>
          </button>

          <button
            onClick={() => router.push('/admin/send-notification')}
            className="group p-5 text-left bg-white hover:bg-gray-50 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 border border-slate-200 hover:border-slate-300 cursor-pointer"
          >
            <Users className="w-7 h-7 text-indigo-500 mb-3 transition-colors" />
            <p className="text-sm font-semibold text-slate-700">Send Notification</p>
            <p className="text-xs text-slate-500 mt-1">Notify users</p>
          </button>

          <button
            onClick={() => router.push('/admin/user')}
            className="group p-5 text-left bg-white hover:bg-gray-50 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 border border-slate-200 hover:border-slate-300 cursor-pointer"
          >
            <Shield className="w-7 h-7 text-orange-500 mb-3 transition-colors" />
            <p className="text-sm font-semibold text-slate-700">User Management</p>
            <p className="text-xs text-slate-500 mt-1">Manage users</p>
          </button>

          <button
            onClick={() => router.push('/admin/payment')}
            className="group p-5 text-left bg-white hover:bg-gray-50 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 border border-slate-200 hover:border-slate-300 cursor-pointer"
          >
            <DollarSign className="w-7 h-7 text-teal-500 mb-3 transition-colors" />
            <p className="text-sm font-semibold text-slate-700">Payment History</p>
            <p className="text-xs text-slate-500 mt-1">View payments</p>
          </button>

          <button
            onClick={() => router.push('/admin/contact-us')}
            className="group p-5 text-left bg-white hover:bg-gray-50 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 border border-slate-200 hover:border-slate-300 cursor-pointer"
          >
            <BarChart3 className="w-7 h-7 text-pink-500 mb-3 transition-colors" />
            <p className="text-sm font-semibold text-slate-700">Contact Messages</p>
            <p className="text-xs text-slate-500 mt-1">User inquiries</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
