// components/TipsSection.jsx
import React from "react";
import Image from "next/image";

// Assuming your original tips illustration image is here
import tipImage from "../../assets/tipImage.png"; // <-- IMPORTANT: UPDATE THIS PATH!

const TipsSection = () => {
  const tips = [
    "Add clean image of your product.",
    "Keep descriptions short and catchy.",
    "Lorem Ipsum is simply dummy text of the printing.",
    "Text ever since the 1500s, when an unknown.",
    "Survived not only five centuries, but also the leap.",
  ];

  return (
    <div className="flex items-center justify-center bg-white p-4">
      <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center lg:items-start justify-between">
        {/* LEFT SIDE: Illustration Image */}
        {/* This div is the first in the JSX, and explicitly sets order-1 for all sizes (default flow) */}
        <div className="lg:w-1/2 flex justify-center items-center p-4 lg:p-0 mb-8 lg:mb-0 order-1">
          <Image
            src={tipImage}
            alt="Tips for Product Listings Illustration"
            width={600}
            height={400}
            layout="responsive"
            objectFit="contain"
            className="max-h-[450px]"
          />
        </div>

        {/* RIGHT SIDE: Title and Tips List */}
        {/* This div is the second in the JSX, and explicitly sets order-2 for all sizes */}
        <div className="lg:w-1/2 p-4 lg:pl-12 order-2">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 leading-tight">
            <span className="text-green-700">Tips</span> for Attractive and
            Engaging Product Listings
          </h3>

          {/* List Content */}
          <ul className="space-y-3 text-gray-700">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start">
                {/* Checkmark SVG Icon */}
                <svg
                  className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TipsSection;
