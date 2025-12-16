"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import offerImage from "../../assets/offer.png";
import shopImage from "../../assets/shop.png";
import Image from "next/image";
import Button from "@/components/button";
import { GitBranch, ShieldMinus, TicketPercent, Users } from "lucide-react";
import AnalyticsCount from "@/components/analyticsCount";
import TipsSection from "@/components/tipsSection";
import RulesSection from "@/components/rulesSection";
import { fetchDashboardData } from "@/lib/api/dashboard";
import LoadingSpinner from "@/components/loadingSpinner";

const DashboardPage = () => {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDashboardData(router);
        setDashboardData(data);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [router]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] space-y-4">
        <div className="text-red-600 text-center">
          <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
          <p className="text-sm">{error}</p>
        </div>
        <Button
          label="Retry"
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        />
      </div>
    );
  }

  // Map API data to component format
  const analyticsData = dashboardData ? [
    {
      icon: <Users />,
      label: "Active Promotion",
      count: dashboardData["business owner Active promotion"] || 0,
    },
    {
      icon: <TicketPercent />,
      label: "Active Offers",
      count: dashboardData["business owner Active Offers"] || 0,
    },
    {
      icon: <ShieldMinus />,
      label: "Deactivate Offers",
      count: dashboardData["business owner Deactivate Offers"] || 0,
    },
    {
      icon: <GitBranch />,
      label: "Total Branch",
      count: dashboardData["business owner Total Branch"] || 0,
    }
  ] : [];

  return (
    <>
      <div className="flex flex-col lg:flex-row justify-around gap-8 items-stretch w-full">
        {/* CARD 1 — OFFER */}
        <div
          className="bg-white rounded-xl border border-[var(--color-secondary)] shadow-lg 
          p-5 md:p-6 w-full 
          flex flex-col lg:flex-row items-center lg:items-start justify-between 
          overflow-visible min-h-[200px] lg:min-h-[300px]"
        >
          {/* LEFT */}
          <div className="lg:w-1/2 mb:0 md:mb-16 lg:mb-0">
            <h2 className="text-lg md:text-2xl font-semibold text-[var(--color-text-primary)]">
              Create a{" "}
              <span className="text-[var(--color-secondary)]">New</span> Offer
              for Your Shop
            </h2>

            <p className="mt-2 text-sm md:text-base text-[var(--color-text-primary)]">
              Add detailed offer information to attract more customers &
              highlight your shop&apos;s latest promotions.
            </p>

            <Button
              className="mt-4 md:mt-6"
              label="Add new offer"
              onClick={() => router.push("/offers")}
            />
          </div>

          {/* RIGHT IMAGE */}
          <div className="lg:w-1/2 flex justify-center relative overflow-visible">
            <Image
              src={offerImage}
              height={220}
              width={220}
              className="absolute"
              alt="Offer"
            />
          </div>
        </div>

        {/* CARD 2 — SHOP BRANCH */}
        <div
          className="bg-white rounded-xl border border-[var(--color-secondary)] shadow-lg 
          p-5 md:p-6 w-full 
          flex flex-col lg:flex-row items-start lg:items-start justify-between 
          overflow-visible min-h-[200px] lg:min-h-[300px]"
        >
          {/* LEFT */}
          <div className="lg:w-1/2 mb:0 md:mb-16 lg:mb-0">
            <h2 className="text-lg md:text-2xl font-semibold text-[var(--color-text-primary)]">
              Create New{" "}
              <span className="text-[var(--color-secondary)]">Shop Branch</span>
            </h2>

            <p className="mt-2 text-sm md:text-base text-[var(--color-text-primary)]">
              Enter branch information to expand your shop network.
            </p>

            <Button
              className="mt-4 md:mt-6"
              label="Add New Branch"
              onClick={() => router.push("/branches")}
            />

            {/* BRANCH LIST */}
            {/* <div className="mt-4 md:mt-5">
              <p className="font-medium text-gray-700 text-sm md:text-base">
                Your Branches:
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {["V", "A", "J", "C", "K"].map((b, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-green-100 text-[var(--color-secondary)] flex justify-center items-center font-semibold text-xs md:text-sm"
                  >
                    {b}
                  </div>
                ))}
                <button
                  onClick={() => router.push("/branches")}
                  className="text-[var(--color-secondary)] cursor-pointer font-medium hover:underline text-sm md:text-base"
                >
                  View All
                </button>
              </div>
            </div> */}
          </div>

          {/* RIGHT IMAGE */}
          <div className="lg:w-1/2 flex justify-center relative overflow-visible">
            <Image
              src={shopImage}
              height={300}
              width={300}
              className="absolute"
              alt="Shop"
            />
          </div>
        </div>
      </div>
      {/* Analytics Counts after left and right parts */}
      <h1 className="mt-10 md:mt-20 text-2xl text-center font-bold text-[var(--color-secondary)]">
        <span className="text-[var(--color-text-primary)]">Your Shop’s </span>
        Summary
      </h1>

      <div className="grid grid-cols sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-5 place-items-center">
        {analyticsData.map((item, index) => (
          <AnalyticsCount
            key={index}
            icon={item.icon}
            label={item.label}
            count={item.count}
            growth={item.growth}
          />
        ))}
      </div>
      <div className="mt-5 md:mt-10">
        <TipsSection />
      </div>
      <div className="mt-5 md:mt-10">
        <RulesSection />
      </div>
    </>
  );
};

export default DashboardPage;
