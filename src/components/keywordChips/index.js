"use client";

import React, { useState } from "react";
import { Tag, X } from "lucide-react";

const KeywordChips = ({
  value = [],
  onChange,
  placeholder = "Add keywords...",
  className = "",
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword();
    }
  };

  const addKeyword = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue("");
    }
  };

  const removeKeyword = (keywordToRemove) => {
    onChange(value.filter((keyword) => keyword !== keywordToRemove));
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Keywords
      </label>

      {/* Chips Display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md bg-gray-50 min-h-[42px]">
          {value.map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--color-secondary)] text-white text-sm rounded-full"
            >
              <Tag size={12} />
              {keyword}
              <button
                type="button"
                onClick={() => removeKeyword(keyword)}
                className="hover:bg-white/20 rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // Add keyword when user tabs out or clicks away
            if (inputValue.trim()) {
              addKeyword();
            }
          }}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] pr-8"
        />
        <Tag
          size={18}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
      </div>

      <p className="text-xs text-gray-500">
        Press Enter or comma to add keywords
      </p>
    </div>
  );
};

export default KeywordChips;
