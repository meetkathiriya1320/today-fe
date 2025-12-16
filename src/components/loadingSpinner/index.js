"use client";
import React from "react";
import Lottie from "lottie-react";
import loadingAnimation from "../../assets/SandyLoading.json"; // <- path to your Lottie JSON file

const LoadingSpinner = ({ size = "large" }) => {
  const sizeMap = {
    small: "w-6 h-6",
    medium: "w-10 h-10",
    large: "w-28 h-28",
  };

  return (
    <div
      className={`flex items-center justify-center ${sizeMap[size]}`}
      aria-label="Loading"
    >
      <Lottie
        animationData={loadingAnimation}
        loop
        autoplay
        className="w-full h-full"
      />
    </div>
  );
};

export default LoadingSpinner;
