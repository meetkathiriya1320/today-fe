"use client";
import { CircleX } from "lucide-react";
import { useRef } from "react";

const Modal = ({
  title,
  open,
  closeModal,
  icon = true,
  children,
  width = "w-[500px]",
  isDisabled = false,
  disableOutsideClick = false,
  closeButtonOutside = false,
  isBlock = false,
  borderColor = "var(--color-border,#e5e5e5)",
}) => {
  const modalContentRef = useRef(null);

  // When closeButtonOutside is true, automatically disable outside click
  const shouldDisableOutsideClick = closeButtonOutside || disableOutsideClick;

  const handleOverlayClick = (event) => {
    if (shouldDisableOutsideClick) {
      return; // prevent closing by outside click
    }

    if (
      modalContentRef.current &&
      !modalContentRef.current.contains(event.target)
    ) {
      closeModal();
    }
  };

  if (!open) return null;

  return (
    <div className="relative z-50">
      {/* Overlay */}
      <div
        onClick={handleOverlayClick}
        className="fixed inset-0 bg-[var(--color-bg)]/60 backdrop-blur-[4px] transition-opacity duration-300"
      />

      {/* Modal Wrapper */}
      <div
        className="fixed inset-0 flex items-center justify-center p-4 sm:p-0"
        onClick={handleOverlayClick}
      >
        {/* Modal Box */}
        <div
          ref={modalContentRef}
          style={{ maxHeight: "90vh", overflow: "auto" }}
          className={`bg-[var(--color-surface,#ffffff)] border border-[${borderColor}] rounded-2xl shadow-2xl p-6 transform transition-all duration-300 ease-out scale-100 opacity-100 ${width}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-[var(--color-border,#e5e5e5)] pb-3">
            <div className="flex items-center gap-3">
              {isBlock && (
                <div className="w-[8px] h-[28px] bg-[var(--color-secondary)] rounded-md" />
              )}
              <h1 className="text-lg font-semibold text-[var(--color-text-primary,#121212)]">
                {title}
              </h1>
            </div>

            {/* Only show internal close button if closeButtonOutside is false */}
            {closeButtonOutside && (
              <button
                type="button"
                disabled={isDisabled}
                onClick={!isDisabled ? closeModal : undefined}
                className={`transition-transform duration-200 ${isDisabled ? "opacity-50 cursor-default" : "hover:scale-110"
                  }`}
                aria-label="Close modal"
              >
                <CircleX
                  size={24}
                  className="text-[var(var(--color-secondary)] cursor-pointer"
                />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="mt-4 text-[var(--color-text-primary,#121212)] leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
