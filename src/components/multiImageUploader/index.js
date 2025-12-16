"use client";

import { useState, useEffect } from "react";
import { Trash2, Camera } from "lucide-react";

export default function MultiImageUploader({
  value = [],
  onChange,
  error,
  label = "Upload Images",
  onDeleteImage,
}) {
  const [images, setImages] = useState([]);

  // Sync Formik → component (backend + new images)
  useEffect(() => {
    if (!value || value.length === 0) {
      setImages([]);
      return;
    }

    // Convert backend images + uploaded files
    const formatted = value
      .map((item) => {
        if (item instanceof File) {
          return { file: item, url: URL.createObjectURL(item) };
        }

        if (typeof item === "string") {
          // Handle direct URL strings
          const imageId = extractImageId(item);
          return { file: null, url: item, id: imageId };
        }

        if (item.image_url) {
          return { file: null, url: item.image_url, id: item.id };
        }

        return null;
      })
      .filter(Boolean);

    setImages(formatted);
  }, [value]);

  // Extract image ID from URL or business_images array
  const extractImageId = (url) => {
    // Try to find matching image from userData
    return null; // Will be handled by parent component
  };

  const handleSelect = (e) => {
    const files = [...e.target.files];

    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);

    // Return only files + backend ids (optional)
    onChange?.([
      ...updatedImages
        .filter((img) => img.id) // keep backend images
        .map((img) => ({ image_url: img.url, id: img.id })),
      ...updatedImages
        .filter((img) => img.file) // keep new files
        .map((img) => img.file),
    ]);
  };

  const removeImg = async (index) => {
    const imageToRemove = images[index];

    // If it's a backend image with an ID, call delete API
    if (imageToRemove.id && onDeleteImage) {
      try {
        await onDeleteImage(imageToRemove.id);
        // Only update local state if API call succeeds
        const updated = images.filter((_, i) => i !== index);
        setImages(updated);
        onChange?.(
          updated.map((img) =>
            img.file ? img.file : { image_url: img.url, id: img.id }
          )
        );
      } catch (error) {
        console.error("Failed to delete image:", error);
      }
    } else {
      // For new uploads (no ID), just remove from local state
      const updated = images.filter((_, i) => i !== index);
      setImages(updated);
      onChange?.(
        updated.map((img) =>
          img.file ? img.file : { image_url: img.url, id: img.id }
        )
      );
    }
  };

  return (
    <div className="space-y-2">
      {/* Upload Box */}
      <label className="border rounded-xl p-4 cursor-pointer flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100">
        <Camera size={24} className="text-[var(--color-text-primary)]" />
        <p className="text-sm font-bold text-[var(--color-text-primary)]">
          {label}
        </p>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleSelect}
          className="hidden"
        />
      </label>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {/* Image preview */}
      <div className="flex gap-2 flex-wrap">
        {images.map((img, index) => (
          <div
            key={index}
            className="relative group w-28 h-28 overflow-hidden rounded-lg border"
          >
            <img
              src={img.url}
              alt="uploaded"
              className="w-full h-full object-cover"
            />

            <button
              type="button"
              onClick={() => removeImg(index)}
              className="absolute top-1 right-1 bg-red-500 p-1 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
