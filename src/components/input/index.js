"use client";
import React, { useRef, useState, useEffect } from "react";
import Select, { components } from "react-select";
import { ChevronDown } from "lucide-react";
import PhoneInput, { getCountryData } from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// 🟢 Unified height constant
const FIELD_HEIGHT = "42px";

// 🎨 Custom styles for React Select (matching input)
const customSelectStyles = (error, width) => ({
  control: (provided, state) => ({
    ...provided,
    minHeight: FIELD_HEIGHT,
    height: FIELD_HEIGHT,
    boxShadow: "none",
    borderRadius: "0.5rem",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    backgroundColor: state.isDisabled
      ? "var(--color-bg-muted)"
      : "var(--color-bg)",
    borderColor: error
      ? "var(--color-error)"
      : state.isFocused
        ? "var(--color-text-primary)" // ✅ Focus color
        : "var(--color-border)",
    "&:hover": {
      borderColor: error ? "var(--color-error)" : "var(--color-text-primary)", // ✅ Hover color
    },
    width: width ?? "100%",
    transition: "border-color 0.15s ease-in-out",
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: "0 12px",
    display: "flex",
    alignItems: "center",
  }),
  input: (provided) => ({
    ...provided,
    margin: 0,
    padding: 0,
    color: "var(--color-text-primary)",
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    transition: "transform 0.2s ease",
    transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : null,
    color: "var(--color-text-muted)",
    paddingRight: "12px",
  }),
  indicatorSeparator: () => ({ display: "none" }),
  option: (provided, state) => ({
    ...provided,
    fontSize: "14px",
    color: state.isFocused
      ? "var(--color-bg)" // ✅ White text when focused
      : "var(--color-text-primary)",
    backgroundColor: state.isFocused
      ? "var(--color-secondary)" // ✅ Hover background
      : "transparent",
    cursor: "pointer",
    transition: "all 0.15s ease-in-out",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "var(--color-text-primary)",
    fontSize: "14px",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "0.5rem",
    marginTop: "4px",
    backgroundColor: "var(--color-bg)",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
    border: "1px solid var(--color-border)",
    zIndex: 9999,
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
});

// 🟣 Chevron icon
const DropdownIndicator = (props) => (
  <components.DropdownIndicator {...props}>
    <ChevronDown
      className={`w-4 h-4 transition-transform duration-200 ${props.selectProps.menuIsOpen ? "rotate-180" : ""
        } text-[var(--color-text-muted)]`}
    />
  </components.DropdownIndicator>
);

// 🧠 Custom value container (for overflow)
const CustomValueContainer = ({ children, ...props }) => {
  const [values, input] = children;
  const containerRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current) {
        setIsOverflowing(
          containerRef.current.scrollWidth > containerRef.current.clientWidth
        );
      }
    };
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [children]);

  return (
    <components.ValueContainer {...props}>
      <div
        ref={containerRef}
        className="overflow-hidden flex"
        style={{ maxWidth: "calc(100% - 25px)", alignItems: "center" }}
      >
        {values}
      </div>
      {isOverflowing && <div className="px-1">...</div>}
      {input}
    </components.ValueContainer>
  );
};

// 🔹 Unified Input Component
const Input = ({
  label,
  min,
  max,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required,
  disabled,
  onBlur,
  startIcon,
  className,
  endIcon,
  onEndIconClick,
  name,
  isSelect = false,
  selectProps = {},
  isPhone = false,
  phoneProps = {},
  isTextarea = false,
  isKeywords = false,
  keywordValue = [],
  onKeywordsChange,
}) => {
  // Ensure value is always defined to prevent controlled->uncontrolled errors
  const controlledValue = value === undefined || value === null ? "" : value;
  const controlledKeywordsValue = keywordValue || [];

  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (isKeywords && (e.key === "Enter" || e.key === ",")) {
      e.preventDefault();
      addKeyword();
    }
  };

  const addKeyword = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !controlledKeywordsValue.includes(trimmed)) {
      onKeywordsChange([...controlledKeywordsValue, trimmed]);
      setInputValue("");
    }
  };

  const removeKeyword = (keywordToRemove) => {
    onKeywordsChange(
      controlledKeywordsValue.filter((keyword) => keyword !== keywordToRemove)
    );
  };

  return (
    <div className={`w-full ${className}`}>
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

      {/* 🧠 Input, Select, or PhoneInput */}
      {isPhone ? (
        <div
          className={`relative border rounded-lg transition duration-150 ease-in-out 
    ${error
              ? "border-[var(--color-error)]"
              : "border-[var(--color-border)] hover:border-[var(--color-text-primary)] focus-within:border-[var(--color-secondary)]"
            }`}
          style={{ height: "42px" }}
        >
          <PhoneInput
            country={phoneProps.country || "in"}
            value={controlledValue}
            onChange={(phone, country) => {
              onChange && onChange({ target: { value: phone, name }, country });
            }
            }
            onBlur={onBlur}
            disabled={disabled}
            // 🧠 These styles override library defaults
            inputClass="!w-full !h-full !text-sm !border-0 !shadow-none !focus:ring-0 !focus:outline-none !bg-transparent !pl-[52px] !pr-3 !text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
            buttonClass="!border-0 !bg-transparent !pl-3"
            dropdownClass="!text-sm !bg-[var(--color-bg)] !border !border-[var(--color-border)] !rounded-lg !shadow-lg !z-[9999]"
            dropdownStyle={{
              position: 'fixed',
              zIndex: 10000,
              maxHeight: '200px',
              overflowY: 'auto'
            }}
            containerClass="!w-full !h-full !bg-transparent !relative"
            enableSearch={phoneProps.enableSearch !== false}
            autoFormat={phoneProps.autoFormat !== false}
            countryCodeEditable={phoneProps.countryCodeEditable !== false}
            preferredCountries={
              phoneProps.preferredCountries || ["in", "us", "gb", "ca"]
            }
            searchPlaceholder={
              phoneProps.searchPlaceholder || "Search countries"
            }
            {...phoneProps}
          />
        </div>
      ) : isTextarea ? (
        <div className="relative">
          {startIcon && (
            <span className="absolute left-4 top-4 text-[var(--color-text-primary)]">
              {startIcon}
            </span>
          )}

          <textarea
            id={name}
            name={name}
            value={controlledValue}
            onChange={onChange || (() => { })}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={placeholder}
            rows={4}
            className={`block w-full text-sm px-4 py-2 border rounded-lg transition duration-150 ease-in-out resize-none
              ${error
                ? "border-[var(--color-error)]"
                : "border-[var(--color-border)] hover:border-[var(--color-text-primary)] focus:border-[var(--color-secondary)]"
              } ${disabled
                ? "bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] cursor-not-allowed"
                : "bg-[var(--color-bg)] text-[var(--color-text-primary)]"
              } ${startIcon ? "pl-10" : "pl-3"} ${endIcon ? "pr-10" : "pr-3"
              } placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-0`}
          />

          {endIcon && (
            <span
              className="absolute right-3 cursor-pointer top-4 text-[var(--color-text-muted)]"
              onClick={onEndIconClick}
            >
              {endIcon}
            </span>
          )}
        </div>
      ) : isKeywords ? (
        <div className="space-y-2">
          {/* Keywords Chips Display */}
          {controlledKeywordsValue.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md bg-gray-50 min-h-[42px]">
              {controlledKeywordsValue.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--color-secondary)] text-white text-sm rounded-full"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => removeKeyword(keyword)}
                    className="hover:bg-white/20 rounded-full px-1.5 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Keywords Input */}
          <div className="relative">
            {startIcon && (
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-primary)]">
                {startIcon}
              </span>
            )}

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
              placeholder={
                placeholder || "Press Enter or comma to add keywords"
              }
              disabled={disabled}
              className={`block w-full text-sm px-4 py-2 border rounded-lg transition duration-150 ease-in-out
                ${error
                  ? "border-[var(--color-error)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-text-primary)] focus:border-[var(--color-secondary)]"
                } ${disabled
                  ? "bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] cursor-not-allowed"
                  : "bg-[var(--color-bg)] text-[var(--color-text-primary)]"
                } ${startIcon ? "pl-10" : "pl-3"} ${endIcon ? "pr-10" : "pr-3"
                } placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-0`}
              style={{
                height: FIELD_HEIGHT,
                lineHeight: FIELD_HEIGHT,
              }}
            />

            {endIcon && (
              <span
                className="absolute right-3 cursor-pointer top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)]"
                onClick={onEndIconClick}
              >
                {endIcon}
              </span>
            )}
          </div>
        </div>
      ) : !isSelect ? (
        <div className="relative">
          {startIcon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-primary)]">
              {startIcon}
            </span>
          )}

          <input
            id={name}
            name={name}
            type={type}
            min={min}
            max={max}
            value={controlledValue}
            onChange={onChange || (() => { })}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={placeholder}
            className={`block w-full text-sm px-4 py-2 border rounded-lg transition duration-150 ease-in-out
              ${error
                ? "border-[var(--color-error)]"
                : "border-[var(--color-border)] hover:border-[var(--color-text-primary)] focus:border-[var(--color-secondary)]"
              } ${disabled
                ? "bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] cursor-not-allowed"
                : "bg-[var(--color-bg)] text-[var(--color-text-primary)]"
              } ${startIcon ? "pl-10" : "pl-3"} ${endIcon ? "pr-10" : "pr-3"
              } placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-0`}
            style={{
              height: FIELD_HEIGHT,
              lineHeight: FIELD_HEIGHT,
            }}
          />

          {endIcon && (
            <span
              className="absolute right-3 cursor-pointer top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)]"
              onClick={onEndIconClick}
            >
              {endIcon}
            </span>
          )}
        </div>
      ) : (
        <Select
          {...selectProps}
          menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
          styles={customSelectStyles(error, selectProps.width)}
          components={{
            DropdownIndicator,
            ...(selectProps.isMulti && {
              ValueContainer: CustomValueContainer,
            }),
          }}
          isDisabled={disabled}
          placeholder={placeholder}
        />
      )}

      {error && (
        <p className="mt-1 text-xs text-[var(--color-error)] ">{error}</p>
      )}
    </div>
  );
};

export default Input;
