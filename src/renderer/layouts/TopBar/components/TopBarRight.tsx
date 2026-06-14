// src/layouts/components/TopBarRight.tsx
import React, { useState, useMemo, useEffect } from "react";
import {
  RefreshCw,
  Bell,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  MapPin,
  Droplets,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDynamicWeather } from "../../../hooks/useDynamicWeather";
import { NotificationsDropdown } from "./NotificationsDropdown";
import UpdateNotifier from "../../../components/Shared/UpdateNotifier";
import ThemeToggle from "../../../components/Shared/ThemeToggle";
import StatusIndicators from "../../../components/Shared/StatusIndicators";

const TopBarRight: React.FC = () => {
  const navigate = useNavigate();
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
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const WeatherIcon = useMemo(() => {
    if (!weather) return Sun;
    const iconName = getWeatherIcon(weather.condition);
    const iconMap: Record<string, any> = {
      Sun,
      Cloud,
      CloudRain,
      CloudLightning,
      CloudFog,
      CloudDrizzle: CloudRain,
      CloudSnow: Cloud,
      Snowflake: Cloud,
    };
    return iconMap[iconName] || Sun;
  }, [weather, getWeatherIcon]);

  const handleRefreshWeather = async () => {
    setRefreshing(true);
    await refreshWeather();
    setRefreshing(false);
  };

  const handleRefreshLocation = async () => {
    await refreshLocation();
    setShowLocationMenu(false);
  };

  const handleLocationSelect = async (index: number) => {
    await getWeatherForSavedLocation(index);
    setShowLocationMenu(false);
  };

  // Manual session refresh (if needed, can be passed as prop from parent)
  const handleRefreshSession = () => {
    // This could trigger a global event to refetch session info
    window.dispatchEvent(new CustomEvent("refresh-session"));
  };

  return (
    <div className="flex items-center gap-3">
       <StatusIndicators />
      {/* Weather widget with dropdown */}
      <div className="relative hidden lg:block">
        <div
          className="flex items-center px-3 py-2 rounded-lg cursor-pointer min-w-[200px]"
          style={
            weather && !weatherLoading
              ? {
                  background: getWeatherColorScheme(weather.condition).bg,
                  border: "1px solid var(--border-color)",
                }
              : {
                  background: "rgba(46,125,50,0.1)",
                  border: "1px solid var(--border-color)",
                }
          }
          onClick={() => setShowLocationMenu(!showLocationMenu)}
        >
          {weatherLoading ? (
            <div className="flex justify-center w-full">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--accent-green)]" />
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                {weather && (
                  <WeatherIcon
                    className="w-5 h-5"
                    style={{
                      color: getWeatherColorScheme(weather.condition).icon,
                    }}
                  />
                )}
                <div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">
                    {weather ? `${weather.temperature}°C` : "--°C"}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] truncate max-w-[120px]">
                    {weather
                      ? `${weather.condition} • ${currentLocation?.city || currentLocation?.name || "Unknown"}`
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
                  <RefreshCw className="w-3 h-3 text-[var(--text-secondary)]" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Location dropdown menu */}
        {showLocationMenu && (
          <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="p-3 border-b">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Locations
              </div>
            </div>
            <div className="max-h-80 overflow-auto">
              <button
                onClick={handleRefreshLocation}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between border-b"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="text-sm font-medium">Current Location</div>
                    {currentLocation && (
                      <div className="text-xs text-gray-500 truncate">
                        {currentLocation.city || currentLocation.name}
                      </div>
                    )}
                  </div>
                </div>
                <RefreshCw className="w-4 h-4 text-gray-400" />
              </button>
              {savedLocations.map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLocationSelect(idx)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{loc.name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {loc.city && `${loc.city}, `}
                        {loc.province}
                      </div>
                    </div>
                    {currentLocation?.lat === loc.lat &&
                      currentLocation?.lon === loc.lon && (
                        <div className="w-2 h-2 rounded-full bg-green-500" />
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
        onClick={handleRefreshSession}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--accent-green)] text-[var(--sidebar-text)] border-none"
      >
        <RefreshCw className="w-4 h-4" />
        <span className="hidden md:inline text-sm">Refresh</span>
      </button>

      <UpdateNotifier />
      <ThemeToggle/>

      {/* Notifications Dropdown */}
      <NotificationsDropdown />
    </div>
  );
};

export default TopBarRight;
