"use client";
import React from "react";
import { LoaderCircle } from "lucide-react";

const sizeClasses = {
  small: "text-sm px-3 py-1.5 h-8",
  medium: "text-base px-4 py-2.5 h-10",
  large: "text-lg px-6 py-3 h-12",
};

const Button = ({
  label,
  onClick,
  startIcon,
  endIcon,
  loading = false,
  disabled = false,
  type = "button",
  size = "medium",
  className = "",
  fullWidth = false,
  variant = "primary", // 'primary' | 'secondary' | 'outline'
  loadingText = "Loading...",
}) => {
  const isDisabled = disabled || loading;

  const variantClasses = {
    primary: `
      bg-[var(--color-secondary)] text-[var(--color-bg)]
      focus:ring-2 focus:ring-[var(--color-secondary)] focus:ring-offset-2
      ${
        !loading
          ? "hover:bg-[color-mix(in srgb, var(--color-secondary) 90%, black 10%)]"
          : ""
      }
    `,
    secondary: `
      bg-[var(--color-primary)] text-[var(--color-text-primary)]
      focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2
      ${
        !loading
          ? "hover:bg-[color-mix(in srgb, var(--color-primary) 90%, black 10%)]"
          : ""
      }
    `,
    outline: `
      border border-[var(--color-secondary)] text-[var(--color-secondary)]
      focus:ring-2 focus:ring-[var(--color-secondary)] focus:ring-offset-2
    `,
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={!isDisabled ? onClick : undefined}
      className={`
        relative cursor-pointer inline-flex items-center justify-center font-semibold rounded-lg
        transition-all duration-300 ease-in-out
        active:scale-[0.97]
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? "w-full" : ""}
        ${isDisabled ? "opacity-70 cursor-not-allowed" : "hover:shadow-md"}
        ${className}
      `}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <LoaderCircle className="animate-spin" size={18} />
          <span className="whitespace-nowrap">{loadingText}</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          {startIcon && (
            <span className="inline-flex items-center">{startIcon}</span>
          )}
          {label && <span className="whitespace-nowrap">{label}</span>}
          {endIcon && (
            <span className="inline-flex items-center">{endIcon}</span>
          )}
        </div>
      )}
    </button>
  );
};

export default Button;
