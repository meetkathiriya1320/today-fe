"use client";
import React from "react";
import { TrendingUp, TrendingDown, Tag } from "lucide-react";
import Image from "next/image";
import backgroundSummaryImage from "../../assets/BackgroundSummary.png";

// Growth Badge (unchanged)
const GrowthBadge = ({ value }) => {
  if (!value) return null;
  const numValue = parseFloat(value.replace(/%/g, ""));
  const isPositive = numValue >= 0;
  const displayValue = `${isPositive ? "+" : ""}${value}`;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const bgColor = isPositive ? "bg-green-50" : "bg-red-50";
  const textColor = isPositive ? "text-green-700" : "text-red-700";

  return (
    <div
      className={`flex items-center border border-[#96B4A333] space-x-1 ${bgColor} ${textColor} text-xs font-medium px-2 py-1 rounded-md`}
    >
      <Icon className="w-3 h-3" />
      <span>{displayValue}</span>
    </div>
  );
};

const AnalyticsCount = ({
  icon, // <-- Accepts JSX directly (ex: <ShoppingBag />)
  label,
  count,
  growth,
  onEdit,
  onDelete,
  bgColor = "bg-white",
  textColor = "text-gray-900",
}) => {
  const customStyles = "rounded-[1.25rem] border border-gray-100 shadow-sm";

  return (
    <div
      className={`relative p-6 w-full ${bgColor} ${textColor} ${customStyles} transition hover:shadow-md overflow-hidden`}
    >
      {/* Background Image */}
      <Image
        src={backgroundSummaryImage}
        alt="Background Pattern"
        fill
        className="absolute inset-0 z-0 opacity-100 object-cover"
      />

      <div className="relative z-10 space-y-4">
        {/* Icon + Label */}
        <div className="flex items-center space-x-2">
          {icon && (
            <div className="p-2 rounded-lg bg-white shadow-sm border border-gray-100">
              {icon} {/* Render JSX icon directly */}
            </div>
          )}
          <p className="text-base font-medium text-gray-700">
            {label ?? "No Label"}
          </p>
        </div>

        {/* Count + Growth */}
        <div className="flex items-end space-x-4">
          <h2 className="text-2xl md:text-5xl font-semibold leading-none">
            {count ?? "—"}
          </h2>
          {growth && (
            <div className="mb-1 ">
              <GrowthBadge value={growth} />
            </div>
          )}
        </div>

        {/* Edit/Delete (Optional) */}
        {(onEdit || onDelete) && (
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {/* Add your edit/delete buttons here if needed */}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsCount;
