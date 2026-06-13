// src/components/Shared/PageNotFound.tsx - Simplified for offline app
import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Home,
  Search,
  RefreshCw,
  ArrowLeft,
  Users,
  Package,
  BarChart3,
  Settings,
  Sprout,
  Leaf,
  MapPin,
  DollarSign,
  Calendar,
  Warehouse,
  Sun,
  CloudRain
} from 'lucide-react';

const PageNotFound: React.FC = () => {
  // All quick links - no permission checks
  const quickLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: Home, color: 'var(--primary-color)' },
    { path: '/workers', label: 'Workers', icon: Users, color: 'var(--primary-color)' },
    { path: '/assignments', label: 'Assignments', icon: Package, color: 'var(--primary-color)' },
    { path: '/pitaks', label: 'Pitaks', icon: MapPin, color: 'var(--primary-color)' },
    { path: '/farms/bukid', label: 'Farms', icon: Sprout, color: 'var(--primary-color)' },
    { path: '/finance/debts', label: 'Debts', icon: DollarSign, color: 'var(--primary-color)' },
    { path: '/finance/worker-payments', label: 'Payments', icon: DollarSign, color: 'var(--primary-color)' },
    { path: '/inventory', label: 'Inventory', icon: Warehouse, color: 'var(--primary-color)' },
    { path: '/reports', label: 'Reports', icon: BarChart3, color: 'var(--primary-color)' },
    { path: '/sessions', label: 'Sessions', icon: Calendar, color: 'var(--primary-color)' },
    { path: '/settings', label: 'Settings', icon: Settings, color: 'var(--primary-color)' }
  ];

  const handleGoBack = () => {
    window.history.back();
  };

  // Get season indicator (for decoration)
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 5 && month <= 10) return { name: 'Rainy Season', icon: CloudRain, color: 'var(--primary-color)' };
    return { name: 'Dry Season', icon: Sun, color: 'var(--primary-color)' };
  };

  const currentSeason = getCurrentSeason();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--background-color)]">
      <div className="relative z-10 max-w-4xl w-full">
        {/* Error Code Display */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="text-9xl font-bold tracking-tighter text-[var(--primary-color)]">
              4<span className="relative">
                0
                <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full animate-ping bg-[var(--warning-color)]"></div>
              </span>4
            </div>
            <div className="absolute -top-6 -right-6 animate-bounce">
              <AlertTriangle className="w-12 h-12 text-[var(--warning-color)]" />
            </div>
          </div>
          <div className="mt-2 text-lg font-semibold tracking-widest uppercase text-[var(--text-secondary)]">
            Page Not Found
          </div>
        </div>

        {/* Error Message Card */}
        <div className="bg-[var(--card-bg)] rounded-xl p-8 mb-8 text-center shadow-sm border border-[var(--border-color)]">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-[var(--primary-color)]/10">
            <Leaf className="w-10 h-10 text-[var(--primary-color)]" />
          </div>

          <h1 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">
            Page Not Found
          </h1>

          <p className="text-base mb-6 max-w-2xl mx-auto text-[var(--text-secondary)]">
            The page you're looking for could not be found. It might have been moved, 
            or you might have entered an incorrect address. Please use the navigation 
            below to find your way back.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 bg-[var(--card-secondary-bg)] border border-[var(--border-color)]">
            <Search className="w-4 h-4 text-[var(--text-secondary)]" />
            <code className="text-sm font-mono text-[var(--text-primary)]">
              {window.location.pathname}
            </code>
          </div>

          {/* Season Indicator */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--card-secondary-bg)] border border-[var(--border-color)]">
            {React.createElement(currentSeason.icon, {
              className: "w-4 h-4",
              style: { color: currentSeason.color }
            })}
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              {currentSeason.name}
            </span>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="bg-[var(--card-bg)] rounded-xl p-6 mb-8 shadow-sm border border-[var(--border-color)]">
          <h2 className="text-lg font-semibold mb-6 text-center text-[var(--text-primary)]">
            Quick Navigation
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link
                  key={index}
                  to={link.path}
                  className="group flex flex-col items-center p-4 rounded-lg transition-all duration-200 hover:shadow-md bg-[var(--card-secondary-bg)] border border-[var(--border-color)]"
                >
                  <div className="p-3 rounded-full mb-3 transition-all duration-200 group-hover:scale-110" style={{
                    backgroundColor: `${link.color}20`,
                    border: `2px solid ${link.color}40`
                  }}>
                    <Icon className="w-6 h-6" style={{ color: link.color }} />
                  </div>
                  <span className="text-sm font-medium text-center text-[var(--text-primary)]">
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoBack}
            className="px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-md bg-[var(--card-secondary-bg)] border border-[var(--border-color)] text-[var(--text-primary)]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <Link
            to="/dashboard"
            className="px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-md hover:scale-105 bg-[var(--primary-color)] text-white"
          >
            <Home className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>

          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-md bg-[var(--card-secondary-bg)] border border-[var(--border-color)] text-[var(--text-primary)]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Page</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm mb-2 text-[var(--text-secondary)]">
            Need assistance? Contact support if you believe this is an error.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-[var(--text-secondary)]">
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color)]"></div>
              Farm Management System
            </span>
            <span>•</span>
            <span>Error Code: 404</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--card-secondary-bg)] border border-[var(--border-color)]">
            <div className="w-2 h-2 rounded-full bg-[var(--success-color)] animate-pulse"></div>
            <span className="text-xs text-[var(--text-secondary)]">
              Farm Management System • v2.0 • {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </div>

      {/* Decorative farm elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-16 h-16 rounded-full bg-[var(--primary-color)]"></div>
        <div className="absolute bottom-4 left-3/4 w-12 h-12 rounded-full bg-[var(--accent-brown)]"></div>
        <div className="absolute bottom-8 left-1/2 w-20 h-20 rounded-full bg-[var(--primary-color)]/50"></div>
        <div className="absolute bottom-16 left-10 w-8 h-8 rounded-full bg-[var(--warning-color)]"></div>
      </div>
    </div>
  );
};

export default PageNotFound;