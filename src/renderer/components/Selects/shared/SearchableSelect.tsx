// src/components/Selects/SearchableSelect.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, X } from "lucide-react";

export interface Option {
  id: number;
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
}

interface SearchableSelectProps {
  value: number | null;
  onChange: (id: number | null, option?: Option) => void;
  fetchOptions: (search: string) => Promise<Option[]>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  initialOptions?: Option[];
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  fetchOptions,
  placeholder = "Select...",
  disabled = false,
  className = "",
  icon,
  initialOptions = [],
}) => {
  const [options, setOptions] = useState<Option[]>(initialOptions);
  const [filtered, setFiltered] = useState<Option[]>(initialOptions);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0, width: 0 });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load initial options
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const opts = await fetchOptions("");
        setOptions(opts);
        setFiltered(opts);
      } catch (error) {
        console.error("Failed to load options", error);
      } finally {
        setLoading(false);
      }
    };
    if (initialOptions.length === 0) load();
  }, [fetchOptions, initialOptions]);

  // Filter on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFiltered(options);
      return;
    }
    const lower = searchTerm.toLowerCase();
    setFiltered(options.filter((opt) => opt.label.toLowerCase().includes(lower)));
  }, [searchTerm, options]);

  // Focus when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, updatePosition]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard: Escape closes
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelect = (opt: Option) => {
    onChange(opt.id, opt);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const selectedOption = options.find((opt) => opt.id === value);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-4 py-2 rounded-xl text-left flex items-center gap-2 transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
        style={{
          backgroundColor: "var(--input-bg)",
          borderColor: "var(--input-border)",
          color: "var(--text-primary)",
          minHeight: "42px",
        }}
      >
        {icon && <div className="flex-shrink-0" style={{ color: "var(--primary-color)" }}>{icon}</div>}
        <div className="flex-1 min-w-0 truncate">
          {selectedOption ? (
            <span className="font-medium">{selectedOption.label}</span>
          ) : (
            <span style={{ color: "var(--text-tertiary)" }}>{placeholder}</span>
          )}
          {selectedOption?.subLabel && (
            <div className="text-xs truncate" style={{ color: "var(--text-tertiary)" }}>
              {selectedOption.subLabel}
            </div>
          )}
        </div>
        {selectedOption && !disabled && (
          <button
            onClick={handleClear}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0"
            style={{ color: "var(--text-secondary)" }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
          style={{ color: "var(--text-secondary)" }}
        />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[9999] rounded-xl shadow-xl overflow-hidden animate-fadeIn"
            style={{
              top: dropdownStyle.top,
              left: dropdownStyle.left,
              width: dropdownStyle.width,
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--border-color)",
              maxHeight: "380px",
            }}
          >
            <div className="p-2 border-b" style={{ borderColor: "var(--border-color)" }}>
              <div className="relative">
                <Search
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4"
                  style={{ color: "var(--text-tertiary)" }}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  style={{
                    backgroundColor: "var(--card-secondary-bg)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: "280px" }}>
              {loading && options.length === 0 && (
                <div className="p-3 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                  Loading...
                </div>
              )}
              {!loading && filtered.length === 0 && (
                <div className="p-3 text-center text-sm" style={{ color: "var(--text-tertiary)" }}>
                  No results
                </div>
              )}
              {filtered.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt)}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2 transition-colors text-sm cursor-pointer hover:bg-[var(--card-hover-bg)] ${
                    opt.id === value
                      ? "bg-[var(--primary-light)] dark:bg-[var(--primary-color)]/20"
                      : ""
                  }`}
                  style={{ borderBottom: "1px solid var(--border-color)" }}
                >
                  {opt.icon && (
                    <div className="flex-shrink-0" style={{ color: "var(--primary-color)" }}>
                      {opt.icon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{opt.label}</div>
                    {opt.subLabel && (
                      <div className="text-xs truncate mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                        {opt.subLabel}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};