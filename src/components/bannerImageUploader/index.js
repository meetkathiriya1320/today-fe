"use client";
import React, { useRef, useState, useEffect } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

/**
 * Banner Image Uploader Component
 *
 * Props:
 * - value: preview image URL or File (optional)
 * - onChange: function(file) — triggered when a file is selected
 * - onDelete: function() — triggered when delete is clicked
 * - label: string — label text
 * - error: string — error message
 * - required: boolean — show required asterisk
 * - aspectRatio: string — aspect ratio for preview (default: "16/9")
 * - size: string — width and height (e.g., "200px", "300px", default: undefined for responsive)
 */
export default function BannerImageUploader({
  label = "Banner Image",
  error = "",
  required = false,
  value = null,
  onChange,
  onDelete,
  aspectRatio = "16/9",
  size = undefined,
}) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (value instanceof File) {
      setPreview(URL.createObjectURL(value));
    } else if (typeof value === "string" && value) {
      setPreview(value);
    } else {
      setPreview(null);
    }
  }, [value]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
      onChange?.(file);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onDelete?.();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
      onChange?.(file);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label
          className={`block text-[14px] font-bold mb-2 ${
            error
              ? "text-[var(--color-error)]"
              : "text-[var(--color-text-primary)]"
          }`}
        >
          {label}
          {required && <span className="text-[var(--color-error)]"> *</span>}
        </label>
      )}

      <div
        onClick={() => !preview && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed overflow-hidden cursor-pointer transition-all ${
          isDragging
            ? "border-[var(--color-primary)] bg-blue-50"
            : error
            ? "border-[var(--color-error)] bg-red-50"
            : "border-gray-300 bg-gray-50 hover:bg-gray-100"
        }`}
        style={{
          aspectRatio,
          width: size || "100%",
          height: size ? size : undefined,
          maxWidth: size ? size : "100%",
        }}
      >
        {preview ? (
          <div className="relative w-full h-full group">
            <img
              src={preview}
              alt="Banner preview"
              className="w-full h-full object-cover"
            />
            {/* Delete button overlay */}
            <button
              type="button"
              onClick={handleDelete}
              className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            <ImagePlus size={48} className="mb-2 text-gray-400" />
            <p className="text-sm font-medium">
              {isDragging ? "Drop image here" : "Click or drag image to upload"}
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG</p>
          </div>
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
        <p className="mt-1 text-xs text-[var(--color-error)]">{error}</p>
      )}
    </div>
  );
}
