"use client";
import { MoveLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const SectionHeader = ({
  title,
  rightIcon = null,
  rightContent = null,
  className = "",
  backArrow = false,
  mainHeader = false,
  onBack,
}) => {
  const router = useRouter();

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else if (window.history.length > 1) {
      router.push(-1); // Go back if history exists
    } else {
      router.push("/login"); // Fallback to home
    }
  };

  return (
    <div className={`flex items-center justify-between mb-3 ${className}`}>
      {/* Left: Back + Title */}
      <div className="flex items-center">
        {backArrow && (
          <button
            onClick={handleBackClick}
            className="mr-3 p-1 rounded hover:bg-gray-200"
          >
            <MoveLeft />
          </button>
        )}
        <h2
          className={`font-bold text-[var(--primary-color)] ${mainHeader ? "text-2xl" : "text-base md:text-lg lg:text-xl"
            }`}
        >
          {title}
        </h2>
      </div>

      {/* Right: Optional Icon or Content */}
      {rightIcon && (
        <button className="p-1 rounded hover:bg-gray-200">{rightIcon}</button>
      )}
      {rightContent && <div>{rightContent}</div>}
    </div>
  );
};

export default SectionHeader;
