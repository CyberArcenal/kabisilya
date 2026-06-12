// src/renderer/pages/settings/components/ThemeTab.tsx
import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";

const ThemeTab: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h3 className="text-md font-semibold text-[var(--text-primary)] mb-2">Theme Preference</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">Choose between light and dark mode for the application.</p>
        <div className="flex gap-4">
          <button
            onClick={() => theme !== "light" && toggleTheme()}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${theme === "light" ? "border-[var(--primary-color)] bg-[var(--primary-light)]" : "border-[var(--border-color)]"}`}
          >
            <Sun className="w-8 h-8 mx-auto mb-2" />
            <div className="text-sm font-medium">Light</div>
          </button>
          <button
            onClick={() => theme !== "dark" && toggleTheme()}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${theme === "dark" ? "border-[var(--primary-color)] bg-[var(--primary-light)]" : "border-[var(--border-color)]"}`}
          >
            <Moon className="w-8 h-8 mx-auto mb-2" />
            <div className="text-sm font-medium">Dark</div>
          </button>
        </div>
      </div>
      <div className="bg-[var(--card-secondary-bg)] p-4 rounded-xl">
        <p className="text-sm text-[var(--text-secondary)]">Preview: The theme change affects the entire application interface.</p>
      </div>
    </div>
  );
};

export default ThemeTab;