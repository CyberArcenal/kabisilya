// src/renderer/components/TopBar.tsx (updated)
import {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  Droplets, RefreshCw,
  CalendarDays,
  AlertCircle,
  Menu,
  Calendar,
  Search, Bell,
  MapPin
} from "lucide-react";
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import sessionAPI, { type Session } from "../../api/core/session";
import { useDynamicWeather } from "../../hooks/useDynamicWeather";
import { useDefaultSessionId } from "../../utils/config/farmConfig";
import UpdateNotifier from "./UpdateNotifier";
import { NotificationDrawer } from "./NotificationDrawer";

interface TopBarProps {
  toggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [sessionDetails, setSessionDetails] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  const defaultSessionId = useDefaultSessionId();

  // Fetch session details whenever defaultSessionId changes
  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!defaultSessionId) {
        setSessionDetails(null);
        setSessionLoading(false);
        return;
      }
      setSessionLoading(true);
      try {
        const response = await sessionAPI.getById(defaultSessionId);
        if (response.status && response.data) {
          setSessionDetails(response.data);
        } else {
          console.warn("Failed to fetch session details for ID:", defaultSessionId);
          setSessionDetails(null);
        }
      } catch (error) {
        console.error("Error fetching session details:", error);
        setSessionDetails(null);
      } finally {
        setSessionLoading(false);
      }
    };

    fetchSessionDetails();
  }, [defaultSessionId]);

  // Manual refresh function (can be called by button)
  const refetchSession = async () => {
    if (!defaultSessionId) {
      setSessionDetails(null);
      return;
    }
    setRefreshing(true);
    try {
      const response = await sessionAPI.getById(defaultSessionId);
      if (response.status && response.data) {
        setSessionDetails(response.data);
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Use dynamic weather hook
  const {
    weather,
    currentLocation,
    savedLocations,
    loading: weatherLoading,
    refreshWeather,
    refreshLocation,
    getWeatherForSavedLocation,
    getWeatherIcon,
    getWeatherColorScheme,
  } = useDynamicWeather();

  // Weather icon component
  const WeatherIcon = React.useMemo(() => {
    if (!weather) return Sun;

    const iconName = getWeatherIcon(weather.condition);
    const iconMap: { [key: string]: any } = {
      Sun: Sun,
      Cloud: Cloud,
      CloudRain: CloudRain,
      CloudLightning: CloudLightning,
      CloudFog: CloudFog,
      CloudDrizzle: CloudRain,
      CloudSnow: Cloud,
      Snowflake: Cloud,
    };

    return iconMap[iconName] || Sun;
  }, [weather, getWeatherIcon]);

  // Handle weather refresh
  const handleRefreshWeather = async () => {
    await refreshWeather();
  };

  // Handle location refresh
  const handleRefreshLocation = async () => {
    await refreshLocation();
  };

  // Handle location selection
  const handleLocationSelect = async (index: number) => {
    await getWeatherForSavedLocation(index);
    setShowLocationMenu(false);
  };
  // Callback to update badge from drawer
  const handleUnreadCountChange = (count: number) => {
    setUnreadCount(count);
  };
  // Format location name for display
  const formatLocationName = (location: any) => {
    if (!location) return "Getting location...";

    if (location.isCurrentLocation) {
      return `📍 ${location.city || location.name}`;
    }

    return location.name;
  };

  // Define searchable routes
  const allRoutes = useMemo(
    () => [
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
      {
        path: "/analytics/finance",
        name: "Financial Reports",
        category: "Reports",
      },
      // System
      { path: "/system/users", name: "User Management", category: "System" },
      { path: "/system/audit", name: "Audit Trail", category: "System" },
      {
        path: "/system/sessions",
        name: "Session Management",
        category: "System",
      },
      { path: "/system/settings", name: "Farm Settings", category: "System" },
      { path: "/system/profile", name: "My Profile", category: "System" },
    ],
    [],
  );

  // Filter routes based on search query
  const filteredRoutes = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return allRoutes.filter(
      (route) =>
        route.name.toLowerCase().includes(query) ||
        route.path.toLowerCase().includes(query.replace(/\s+/g, "-")) ||
        route.category.toLowerCase().includes(query),
    );
  }, [searchQuery, allRoutes]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredRoutes.length > 0) {
      navigate(filteredRoutes[0].path);
      setSearchQuery("");
      setShowSearchResults(false);
    }
  };

  const handleRouteSelect = (path: string) => {
    navigate(path);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const handleRefresh = async () => {
    await refetchSession();
  };

  // Get session status color
  const getSessionStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "var(--accent-green)";
      case "closed":
        return "var(--accent-orange)";
      case "archived":
        return "var(--text-tertiary)";
      default:
        return "var(--border-color)";
    }
  };

  // Format season type for display
  const formatSeasonType = (seasonType: string) => {
    switch (seasonType?.toLowerCase()) {
      case "tag-ulan":
        return "Tag-ulan";
      case "tag-araw":
        return "Tag-araw";
      default:
        return seasonType || "Custom";
    }
  };

  // Today's date
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  // Render weather widget
  const renderWeatherWidget = () => {
    if (weatherLoading) {
      return (
        <div className="flex items-center justify-center w-full">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        </div>
      );
    }

    if (!weather) {
      return <div className="text-white text-sm">Weather unavailable</div>;
    }

    const colorScheme = getWeatherColorScheme(weather.condition);

    return (
      <div
        className="flex items-center justify-between w-full cursor-pointer"
        onClick={() => setShowLocationMenu(!showLocationMenu)}
      >
        <div className="flex items-center gap-3">
          <WeatherIcon
            className="w-5 h-5 flex-shrink-0"
            style={{ color: colorScheme.icon }}
          />
          <div>
            <div className="text-sm font-medium text-white">
              {weather.temperature}°C
            </div>
            <div className="text-xs text-white/80">{weather.condition}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1">
            <Droplets className="w-3 h-3 text-white/80" />
            <span className="text-xs text-white/80">{weather.humidity}%</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRefreshWeather();
            }}
            className="p-1 hover:bg-white/10 rounded"
          >
            <RefreshCw className="w-3 h-3 text-white" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <header
      className="sticky top-0 z-40 windows-card border-b"
      style={{
        background: "var(--sidebar-bg)",
        borderColor: "var(--sidebar-border)",
        borderRadius: "0",
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleSidebar}
            aria-label="Toggle menu"
            className="windows-btn windows-btn-secondary p-2 md:hidden"
            style={{
              background: "var(--accent-green-light)",
              borderColor: "var(--accent-green)",
              color: "var(--accent-green-dark)",
            }}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Default Session Display */}
          <div
            className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              background: "rgba(46, 125, 50, 0.1)",
              border: "1px solid var(--border-color)",
              minWidth: "220px",
            }}
          >
            <CalendarDays
              className="w-4 h-4 flex-shrink-0"
              style={{ color: "var(--accent-green)" }}
            />
            <div className="min-w-0">
              {sessionLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-pulse h-3 w-24 bg-[var(--accent-green-light)] rounded"></div>
                </div>
              ) : sessionDetails ? (
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-medium truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {formatSeasonType(sessionDetails.seasonType as string)}{" "}
                      {sessionDetails.year}
                    </span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full capitalize"
                      style={{
                        background: getSessionStatusColor(
                          sessionDetails.status,
                        ),
                        color: "white",
                      }}
                    >
                      {sessionDetails.status}
                    </span>
                  </div>
                  <div
                    className="text-xs truncate"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    ID: {sessionDetails.id} •{" "}
                    {sessionDetails.startDate
                      ? new Date(sessionDetails.startDate).toLocaleDateString()
                      : "No start date"}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <AlertCircle
                      className="w-3 h-3"
                      style={{ color: "var(--accent-red)" }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      No Active Session
                    </span>
                  </div>
                  <div
                    className="text-xs cursor-pointer hover:underline"
                    style={{ color: "var(--accent-green)" }}
                    onClick={() => navigate("/system/sessions")}
                  >
                    Click to set default session
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Date Display */}
          <div
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              background: "rgba(46, 125, 50, 0.1)",
              border: "1px solid var(--border-color)",
            }}
          >
            <Calendar
              className="w-4 h-4"
              style={{ color: "var(--accent-green)" }}
            />
            <div className="flex flex-col">
              <div
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {today.toLocaleDateString("en-US", { weekday: "long" })}
              </div>
              <div
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                {formattedDate}
              </div>
            </div>
          </div>
        </div>

        {/* Center Section - Search Bar */}
        <div className="flex-1 max-w-xl mx-6">
          <div className="relative">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3! pointer-events-none">
                  <Search
                    className="w-4 h-4"
                    style={{ color: "var(--text-tertiary)" }}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Search farms, workers, assignments..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSearchResults(false), 200)
                  }
                  className="windows-input pl-10! pr-4 py-2.5 text-sm w-full"
                  style={{
                    background: "white",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{
                        background: "var(--border-color)",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      <span className="text-xs">×</span>
                    </div>
                  </button>
                )}
              </div>
            </form>

            {/* Search Results Dropdown */}
            {showSearchResults && filteredRoutes.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-xl z-50"
                style={{
                  background: "white",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div
                  className="p-3 border-b"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <div
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Quick Navigation
                  </div>
                </div>
                <div className="max-h-80 overflow-auto">
                  {filteredRoutes.map((route, index) => (
                    <button
                      key={index}
                      onClick={() => handleRouteSelect(route.path)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b last:border-b-0 text-sm flex justify-between items-center"
                      style={{
                        borderColor: "var(--border-color)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <span>{route.name}</span>
                      <span
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          background: "var(--card-secondary-bg)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {route.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center gap-3">
          <UpdateNotifier />
          {/* Weather Widget with Location Menu */}
          <div className="relative">
            <div
              className="hidden lg:flex items-center px-3 py-2 rounded-lg"
              style={
                weather && !weatherLoading
                  ? {
                      background: getWeatherColorScheme(weather.condition).bg,
                      border: "1px solid var(--border-color)",
                      minWidth: "200px",
                      cursor: "pointer",
                    }
                  : {
                      background: "rgba(46, 125, 50, 0.1)",
                      border: "1px solid var(--border-color)",
                      minWidth: "200px",
                      cursor: "pointer",
                    }
              }
              onClick={() => setShowLocationMenu(!showLocationMenu)}
            >
              {weatherLoading ? (
                <div className="flex items-center justify-center w-full">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--accent-green)]"></div>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    {weather && (
                      <WeatherIcon
                        className="w-5 h-5 flex-shrink-0"
                        style={{
                          color: weather
                            ? getWeatherColorScheme(weather.condition).icon
                            : "var(--accent-green)",
                        }}
                      />
                    )}
                    <div>
                      <div
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {weather ? `${weather.temperature}°C` : "--°C"}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] truncate max-w-[120px]">
                        {weather
                          ? `${weather.condition} • ${
                              currentLocation?.city ||
                              currentLocation?.name ||
                              "Unknown"
                            }`
                          : "No weather data"}
                      </div>
                    </div>
                  </div>
                  {weather && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRefreshWeather();
                      }}
                      className="p-1 hover:bg-[var(--card-secondary-bg)] rounded"
                    >
                      <RefreshCw
                        className="w-3 h-3"
                        style={{ color: "var(--text-secondary)" }}
                      />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Location Dropdown Menu */}
            {showLocationMenu && (
              <div className="absolute top-full right-0 mt-1 w-64 rounded-lg shadow-xl z-50 bg-white border border-gray-200">
                <div className="p-3 border-b">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Locations
                  </div>
                </div>
                <div className="max-h-80 overflow-auto">
                  {/* Current Location */}
                  <button
                    onClick={() => {
                      handleRefreshLocation();
                      setShowLocationMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium">
                          Current Location
                        </div>
                        {currentLocation && (
                          <div className="text-xs text-gray-500 truncate">
                            {currentLocation.city || currentLocation.name}
                          </div>
                        )}
                      </div>
                    </div>
                    <RefreshCw className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* Saved Locations */}
                  {savedLocations.map((location, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        handleLocationSelect(index);
                        setShowLocationMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">
                            {location.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {location.city && `${location.city}, `}
                            {location.province}
                          </div>
                        </div>
                        {currentLocation?.lat === location.lat &&
                          currentLocation?.lon === location.lon && (
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Refresh Session Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing || sessionLoading}
            className="windows-btn flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              background: "var(--accent-green)",
              color: "white",
              border: "none",
            }}
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden md:inline text-sm">Refresh</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative windows-btn p-2 rounded-lg"
            style={{
              background: "rgba(46, 125, 50, 0.1)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
            }}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-[var(--danger-color)] text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onUnreadCountChange={handleUnreadCountChange}
      />
    </header>
  );
};

export default TopBar;