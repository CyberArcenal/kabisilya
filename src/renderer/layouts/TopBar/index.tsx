// src/layouts/TopBar.tsx
import React from "react";
import TopBarLeft from "./components/TopBarLeft";
import TopBarCenter from "./components/TopBarCenter";
import TopBarRight from "./components/TopBarRight";

interface TopBarProps {
  toggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ toggleSidebar }) => {
  return (
    <header
      className="sticky top-0 z-40 windows-card border-b"
      style={{
        background: "var(--sidebar-bg)",
        borderColor: "var(--sidebar-border)",
        borderRadius: "0",
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 gap-4">
        <TopBarLeft toggleSidebar={toggleSidebar} />
        <TopBarCenter />
        <TopBarRight />
      </div>
    </header>
  );
};

export default TopBar;