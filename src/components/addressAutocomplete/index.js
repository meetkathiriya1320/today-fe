"use client";
import useDebounce from "@/hooks/useDebounce";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Input from "../input";
import LoadingSpinner from "../loadingSpinner";

export default function AddressAutocomplete({
  value = "",
  onChange,
  onSelect,
  label = "Location",
  error = "",
  required = false,
  ...rest
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(true); // ✅ default TRUE → no API on mount
  const isFirstLoad = useRef(true); // track first render
  const containerRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const debouncedQuery = useDebounce(query, 600);

  // Keep input synced with external (Formik) value
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // Calculate dropdown position
  useEffect(() => {
    if ((loading || suggestions.length > 0) && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [loading, suggestions]);

  // FETCH SUGGESTIONS — ONLY IF USER TYPED
  useEffect(() => {
    // ⛔️ Skip API on first load (edit mode)
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    // ⛔️ Skip API if location already selected
    if (selected) return;

    // ⛔️ Skip API if input < 3 chars
    if (!debouncedQuery || debouncedQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
            debouncedQuery
          )}&limit=5&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`,
          { signal: controller.signal }
        );

        const data = await res.json();
        setSuggestions(data.features || []);
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
    return () => controller.abort();
  }, [debouncedQuery, selected]);

  // When user selects suggestion
  const handleSelect = (item) => {
    const formatted = item.properties.formatted;
    const lat = item.properties.lat;
    const lon = item.properties.lon;

    setQuery(formatted);
    setSuggestions([]);
    setSelected(true); // ⛔️ prevents API from reopening

    onSelect?.({ formatted, lat, lon, item });
    onChange?.({ target: { value: formatted } });
  };

  return (
    <div ref={containerRef} className="relative w-full">
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
      <Input
        type="text"
        placeholder="Enter location"
        value={query}
        onFocus={() => {
          if (!selected && suggestions.length > 0) {
            setSuggestions([...suggestions]);
          }
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelected(false); // ✅ user edited → allow API calls again
          onChange?.(e);
        }}
        error={error}
        required={required}
        {...rest}
      />

      {/* Loading */}
      {loading &&
        createPortal(
          <div
            style={{
              position: "absolute",
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              zIndex: 1000,
            }}
            className="bg-white border rounded-md shadow-md mt-1 flex items-center justify-center p-3"
          >
            <LoadingSpinner size="medium" />
            <span className="ml-2 text-gray-500 text-sm">
              Searching your location...
            </span>
          </div>,
          document.body
        )}

      {/* Suggestions */}
      {suggestions.length > 0 &&
        !loading &&
        createPortal(
          <ul
            style={{
              position: "absolute",
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              zIndex: 1000,
            }}
            className="bg-white border rounded-md shadow-md mt-1 max-h-60 overflow-y-auto"
          >
            {suggestions.map((s, i) => (
              <li
                key={i}
                onClick={() => handleSelect(s)}
                className="p-2 hover:bg-blue-100 cursor-pointer text-sm"
              >
                {s.properties.formatted}
              </li>
            ))}
          </ul>,
          document.body
        )}
    </div>
  );
}
