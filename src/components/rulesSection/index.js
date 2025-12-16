// components/RulesSection.jsx (or wherever you put this component)
import React from "react";
import Image from "next/image";

// Assuming your new illustration image is here
import rulesIllustration from "../../assets/ruleImage.png"; // <--- IMPORTANT: Update this path!

const RulesSection = () => {
  const rulePoints = [
    {
      id: 1,
      text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries.",
    },
    {
      id: 2,
      text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries.",
    },
  ];

  return (
    <div className="flex items-center justify-center bg-white p-4">
      {" "}
      {/* Changed background to white/transparent */}
      <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center lg:items-start justify-between">
        {/* LEFT SIDE: Title and Rule Points */}
        <div className="lg:w-1/2 p-4 lg:pr-12 mb-8 lg:mb-0">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 leading-tight">
            <span className="text-green-700">Rules</span> for Handling Fake or
            Incorrect Shop Offers
          </h3>
          <div className="space-y-6">
            {" "}
            {/* Spacing between rule paragraphs */}
            {rulePoints.map((point) => (
              <div key={point.id} className="flex items-start">
                {/* Custom bullet point icon (you can replace with an actual SVG if needed) */}
                <span className="text-green-700 text-2xl mr-3 leading-none transform rotate-45 -mt-1">
                  &#9672;
                </span>
                <p className="text-base text-gray-700">{point.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: Illustration Image */}
        <div className="lg:w-1/2 flex justify-center items-center p-4 lg:p-0 relative">
          <Image
            src={rulesIllustration}
            alt="Rules for Handling Offers Illustration"
            width={600} // Adjust width and height based on your image's aspect ratio
            height={400} // Adjust width and height
            layout="responsive"
            objectFit="contain"
            className="max-h-[450px]" // Limit the maximum height
          />
        </div>
      </div>
    </div>
  );
};

export default RulesSection;
