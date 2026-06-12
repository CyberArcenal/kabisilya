// src/layouts/components/TopBarCenter.tsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

const allRoutes = [
  // Dashboard
  { path: "/", name: "Dashboard", category: "Main" },
  { path: "/dashboard", name: "Dashboard", category: "Main" },
  // Farm Management
  { path: "/farms/bukid", name: "Mga Bukid", category: "Farm" },
  { path: "/farms/pitak", name: "Mga Pitak", category: "Farm" },
  { path: "/farms/assignments", name: "Assignments", category: "Farm" },
  // Workers
  { path: "/workers/list", name: "Worker Directory", category: "Workers" },
  { path: "/workers/attendance", name: "Attendance", category: "Workers" },
  // Finance
  { path: "/finance/payments", name: "Payments", category: "Finance" },
  { path: "/finance/debts", name: "Debt Management", category: "Finance" },
  // Reports
  { path: "/analytics/bukid", name: "Bukid Reports", category: "Reports" },
  { path: "/analytics/pitak", name: "Pitak Reports", category: "Reports" },
  { path: "/analytics/finance", name: "Financial Reports", category: "Reports" },
  // System
  { path: "/system/users", name: "User Management", category: "System" },
  { path: "/system/audit", name: "Audit Trail", category: "System" },
  { path: "/system/sessions", name: "Session Management", category: "System" },
  { path: "/system/settings", name: "Farm Settings", category: "System" },
  { path: "/system/profile", name: "My Profile", category: "System" },
];

const TopBarCenter: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const filteredRoutes = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allRoutes.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.path.toLowerCase().includes(q.replace(/\s+/g, "-")) ||
        r.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredRoutes.length) {
      navigate(filteredRoutes[0].path);
      setSearchQuery("");
      setShowResults(false);
    }
  };

  const handleSelect = (path: string) => {
    navigate(path);
    setSearchQuery("");
    setShowResults(false);
  };

  return (
    <div className="flex-1 max-w-xl mx-6 relative">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search farms, workers, assignments..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[var(--border-color)] flex items-center justify-center"
            >
              <span className="text-xs text-[var(--text-tertiary)]">×</span>
            </button>
          )}
        </div>
      </form>

      {showResults && filteredRoutes.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-[var(--border-color)] z-50 overflow-hidden">
          <div className="p-3 border-b border-[var(--border-color)]">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Quick Navigation
            </div>
          </div>
          <div className="max-h-80 overflow-auto">
            {filteredRoutes.map((route, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(route.path)}
                className="w-full text-left px-4 py-3 hover:bg-[var(--card-hover-bg)] transition-colors border-b last:border-b-0 flex justify-between items-center"
              >
                <span className="text-sm text-[var(--text-primary)]">{route.name}</span>
                <span className="text-xs px-2 py-1 rounded bg-[var(--card-secondary-bg)] text-[var(--text-secondary)]">
                  {route.category}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBarCenter;