const variants = {
  neutral: "bg-gray-100 hover:bg-gray-200 text-gray-800",
  info: "bg-blue-100 hover:bg-blue-200 text-blue-700",
  danger: "bg-red-100 hover:bg-red-200 text-red-700",
  success: "bg-green-100 hover:bg-green-200 text-green-700",
  primary: "bg-black hover:bg-gray-800 text-white",
};

export default function ActionButton({
  title,
  icon,
  onClick,
  variant = "neutral",
  className = "",
  disabled = false,
}) {
  const classes = variants[variant] || variants.neutral;

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex cursor-pointer items-center justify-center h-8 w-8 rounded-md border border-transparent ${classes} disabled:opacity-50 disabled:bg-gray-200 disabled:cursor-not-allowed ${className}`}
    >
      {icon}
    </button>
  );
}
