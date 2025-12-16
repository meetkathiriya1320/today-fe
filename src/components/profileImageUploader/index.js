"use client";
import React, { useRef, useState } from "react";
import { Camera, Edit2, Trash2 } from "lucide-react";

/**
 * Profile Image Uploader Component
 *
 * Props:
 * - value: preview image URL (optional)
 * - onChange: function(file) — triggered when a file is selected
 * - onDelete: function() — triggered when delete is clicked
 */
export default function ProfileImageUploader({
  label = "",
  error = "",
  required,
  value = null,
  onChange,
  onDelete,
}) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(value);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
      onChange?.(file); // send file to parent
    }
  };

  const handleDelete = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onDelete?.();
  };

  return (
    <div className="flex flex-col items-center mb-6 relative">
      {label && (
        <label
          className={`block text-[14px] font-bold mb-1 ${error
              ? "text-[var(--color-error)]"
              : "text-[var(--color-text-primary)]"
            }`}
        >
          {label}
          {required && <span className="text-[var(--color-error)]">*</span>}
        </label>
      )}
      <div className="relative group">
        {/* Profile Image / Placeholder */}
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200 shadow-sm">
          {preview ? (
            <img
              src={preview}
              alt="Profile"
              className="object-cover w-full h-full"
            />
          ) : (
            <Camera size={40} className="text-gray-400 cursor-pointer" />
          )}
        </div>

        {/* Overlay actions */}
        {preview ? (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all rounded-full">
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
            >
              <Edit2 size={16} className="text-gray-700 cursor-pointer" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
            >
              <Trash2 size={16} className="text-red-500 cursor-pointer" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="absolute bottom-0 right-0 p-2 bg-[var(--color-secondary,#013E94)] rounded-full shadow-md text-white "
          >
            <Camera size={16} className="cursor-pointer" />
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {error && (
        <p className="mt-1 text-xs text-[var(--color-error)] ">{error}</p>
      )}
    </div>
  );
}
