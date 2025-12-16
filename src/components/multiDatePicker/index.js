import { useState, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";
import Button from "../button";

// Move constants outside of component
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Function to get day button className
const getDayClassName = (date, startDate, endDate, hoveredDate) => {
  if (!date) return "invisible w-8 h-8";

  const classes = ["w-8 h-8 text-sm rounded-full transition-colors"];

  const dateString = date.toLocaleDateString("en-CA");

  // Selected date
  if (dateString === startDate || dateString === endDate) {
    classes.push("bg-[#377355] text-white hover:bg-[#377355]");
  }
  // In-range highlight
  else if (startDate && (endDate || hoveredDate)) {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(hoveredDate);
    const current = new Date(dateString);

    if (current >= start && current <= end) {
      classes.push("bg-[#d3e7dd] text-[#377355]");
    } else {
      classes.push("text-gray-700");
    }
  }
  // Today highlight
  else if (new Date().toDateString() === date.toDateString()) {
    classes.push("bg-gray-100 text-gray-900");
  } else {
    classes.push("text-gray-700");
  }

  // Hover state
  classes.push("hover:bg-[#cde3d7]");

  return classes.join(" ");
};

const MultiDatePicker = ({
  value = [],
  onChange,
  placeholder = "Select date range...",
  className = "",
  label,
  error,
  required,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState(value[0] || null);
  const [endDate, setEndDate] = useState(value[1] || null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const containerRef = useRef(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update dates when value prop changes
  useEffect(() => {
    setStartDate(value[0] || null);
    setEndDate(value[1] || null);
  }, [value]);

  const handleDateClick = (date) => {
    const dateString = date.toLocaleDateString("en-CA");

    if (!startDate || (startDate && endDate)) {
      setStartDate(dateString);
      setEndDate(null);
      setHoveredDate(null);
    } else {
      if (new Date(dateString) < new Date(startDate)) {
        setEndDate(startDate);
        setStartDate(dateString);
      } else {
        setEndDate(dateString);
      }
      setHoveredDate(null);
      const range = [startDate, dateString].sort();
      onChange(range);
    }
  };

  const handleDateHover = (date) => {
    if (startDate && !endDate) {
      setHoveredDate(date?.toLocaleDateString("en-CA"));
    }
  };

  const clearRange = () => {
    setStartDate(null);
    setEndDate(null);
    setHoveredDate(null);
    onChange([]);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateRange = () => {
    if (!startDate) return "";
    if (!endDate) return formatDate(startDate);
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++)
      days.push(new Date(year, month, day));
    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  return (
    <div className={className}>
      {label && (
        <label
          className={`block text-[14px] font-bold mb-1 ${
            error
              ? "text-[var(--color-error)]"
              : "text-[var(--color-text-primary)]"
          }`}
        >
          {label}
          {required && <span className="text-[var(--color-error)]">*</span>}
        </label>
      )}

      <div className="relative" ref={containerRef}>
        {/* Input Field */}
        <div
          className="w-full min-h-[42px] px-3 py-2 border border-[#808080] rounded-lg bg-white cursor-pointer flex items-center justify-between"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex-1">
            {startDate ? (
              <span className="text-sm">{formatDateRange()}</span>
            ) : (
              <span className="text-sm">{placeholder}</span>
            )}
          </div>
          <Calendar className="w-5 h-5 text-gray-400 ml-2" />
        </div>

        {/* Calendar Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <button
                type="button"
                onClick={() => navigateMonth(-1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                ‹
              </button>
              <h3 className="font-semibold text-gray-900">
                {MONTH_NAMES[currentMonth.getMonth()]}{" "}
                {currentMonth.getFullYear()}
              </h3>
              <button
                type="button"
                onClick={() => navigateMonth(1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                ›
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 p-2">
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1 p-2">
              {getDaysInMonth(currentMonth).map((date, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => date && handleDateClick(date)}
                  onMouseEnter={() => handleDateHover(date)}
                  disabled={!date}
                  className={getDayClassName(
                    date,
                    startDate,
                    endDate,
                    hoveredDate
                  )}
                >
                  {date ? date.getDate() : ""}
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <button
                type="button"
                onClick={clearRange}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear
              </button>
              <Button
                label="Done"
                type="button"
                onClick={() => setIsOpen(false)}
              />
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-[--error]">{error}</p>}
    </div>
  );
};

export default MultiDatePicker;
