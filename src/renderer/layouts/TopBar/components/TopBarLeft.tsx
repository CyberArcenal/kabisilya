// src/layouts/components/TopBarLeft.tsx (simplified)
import React, { useState, useEffect } from "react";
import { Menu, CalendarDays, AlertCircle, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDefaultSessionId } from "../../../utils/config/farmConfig";
import sessionAPI, { type Session } from "../../../api/core/session";
import SessionSelectorModal from "../../../components/Modals/SessionSelectorModal";

interface TopBarLeftProps {
  toggleSidebar: () => void;
}

const TopBarLeft: React.FC<TopBarLeftProps> = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const defaultSessionId = useDefaultSessionId();
  const [sessionDetails, setSessionDetails] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      if (!defaultSessionId) {
        setSessionDetails(null);
        setSessionLoading(false);
        return;
      }
      setSessionLoading(true);
      try {
        const res = await sessionAPI.getById(defaultSessionId);
        if (res.status && res.data) setSessionDetails(res.data);
        else setSessionDetails(null);
      } catch (error) {
        console.error("Error fetching session:", error);
        setSessionDetails(null);
      } finally {
        setSessionLoading(false);
      }
    };
    fetchSession();
  }, [defaultSessionId]);

  const getSessionStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active": return "var(--accent-green)";
      case "closed": return "var(--accent-orange)";
      case "archived": return "var(--text-tertiary)";
      default: return "var(--border-color)";
    }
  };

  const formatSeasonType = (seasonType: string) => {
    switch (seasonType?.toLowerCase()) {
      case "tag-ulan": return "Tag-ulan";
      case "tag-araw": return "Tag-araw";
      default: return seasonType || "Custom";
    }
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });

  const handleSessionClick = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  return (
    <div className="flex items-center gap-4">
      {/* Hamburger menu */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-xl hover:bg-[var(--card-hover-bg)] text-[var(--sidebar-text)] transition-all duration-200"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Session info */}
      <div
        className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(46,125,50,0.1)] border border-[var(--border-color)] min-w-[220px] cursor-pointer hover:bg-[rgba(46,125,50,0.2)] transition-colors"
        onClick={handleSessionClick}
      >
        <CalendarDays className="w-4 h-4 text-[var(--accent-green)]" />
        <div className="min-w-0">
          {sessionLoading ? (
            <div className="animate-pulse h-3 w-24 bg-[var(--accent-green-light)] rounded" />
          ) : sessionDetails ? (
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium truncate text-[var(--text-primary)]">
                  {formatSeasonType(sessionDetails.seasonType as string)} {sessionDetails.year}
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full capitalize text-white"
                  style={{ background: getSessionStatusColor(sessionDetails.status) }}
                >
                  {sessionDetails.status}
                </span>
              </div>
              <div className="text-xs text-[var(--text-secondary)] truncate">
                ID: {sessionDetails.id} •{" "}
                {sessionDetails.startDate
                  ? new Date(sessionDetails.startDate).toLocaleDateString()
                  : "No start date"}
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3 h-3 text-[var(--accent-red)]" />
                <span className="text-xs font-medium text-[var(--text-primary)]">No Active Session</span>
              </div>
              <div className="text-xs text-[var(--accent-green)]">
                Click to set default session
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Date display */}
      <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(46,125,50,0.1)] border border-[var(--border-color)]">
        <Calendar className="w-4 h-4 text-[var(--accent-green)]" />
        <div className="flex flex-col">
          <div className="text-sm font-medium text-[var(--text-primary)]">
            {today.toLocaleDateString("en-US", { weekday: "long" })}
          </div>
          <div className="text-xs text-[var(--text-secondary)]">{formattedDate}</div>
        </div>
      </div>

      <SessionSelectorModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default TopBarLeft;