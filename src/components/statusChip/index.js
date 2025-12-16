const StatusChip = ({ status, size = "sm", className = "" }) => {
  const normalized = status?.toLowerCase();

  const getStatusStyles = () => {
    switch (normalized) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";

      case "approved":
        return "bg-green-100 text-green-800 border-green-200";

      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";

      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";

      case "rejected":
        return "bg-red-200 text-red-900 border-red-300";

      case "block":
        return "bg-red-200 text-red-900 border-red-300";

      case "unblock":
        return "bg-green-200 text-green-900 border-green-300";

      case "verified":
        return "bg-blue-100 text-blue-800 border-blue-200";

      case "unverified":
        return "bg-gray-200 text-gray-700 border-gray-300";

      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const sizeClasses = {
    xs: "px-2 py-0.5 text-xs",
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border ${getStatusStyles()} ${
        sizeClasses[size]
      } ${className}`}
    >
      {status || "Unknown"}
    </span>
  );
};

export default StatusChip;
