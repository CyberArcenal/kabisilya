// src/renderer/components/SideBar.tsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  ChevronDown,
  ChevronRight,
  Users,
  ClipboardList,
  Map,
  MapPin,
  Wheat,
  Trees,
  Users2,
  DollarSign,
  Receipt,
  History,
  Wallet,
  Banknote,
  Scroll,
  BarChart2,
  PieChart,
  LineChart,
  UserCheck,
  CalendarDays,
  ScrollText,
  Bell,
  Sprout,
  HandCoins,
  FileClock,
} from "lucide-react";
import { version, name } from "../../../../package.json";

interface SidebarProps {
  isOpen: boolean;
}

interface MenuItem {
  path: string;
  name: string;
  icon: React.ComponentType<any>;
  category?: string;
  children?: MenuItem[];
}

export function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
  );
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();
  const title = toTitleCase(name);
  const currency = "PH";
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {},
  );

  const menuItems: MenuItem[] = [
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
      category: "core",
    },
    {
      path: "/farms",
      name: "Farm & Plot",
      icon: Trees,
      category: "core",
      children: [
        { path: "/farms/bukid", name: "Mga Bukid", icon: Map },
        { path: "/farms/pitak", name: "Mga Pitak", icon: Wheat },
        {
          path: "/farms/assignments",
          name: "Assignments",
          icon: ClipboardList,
        },
      ],
    },
    {
      path: "",
      name: "Workers",
      icon: Users,
      category: "core",
      children: [
        { path: "/workers", name: "Worker Directory", icon: Users2 },
      ],
    },
    {
      path: "",
      name: "Payroll & Finance",
      icon: DollarSign,
      category: "core",
      children: [
        { path: "/finance/worker/payments", name: "Worker Payments", icon: HandCoins },
        { path: "/finance/payments", name: "Payments", icon: Banknote },
        { path: "/finance/debts", name: "Debt Management", icon: Receipt },
        { path: "/finance/payment/history", name: "Payment History", icon: FileClock },
        { path: "/finance/debt/history", name: "Debt History", icon: Scroll },
      ],
    },
    {
      path: "/analytics",
      name: "Reports & Analytics",
      icon: BarChart2,
      category: "analytics",
      children: [
        { path: "/analytics/bukid", name: "Bukid Reports", icon: PieChart },
        { path: "/analytics/pitak", name: "Pitak Productivity", icon: Wheat },
        {
          path: "/analytics/finance",
          name: "Financial Reports",
          icon: LineChart,
        },
        { path: "/analytics/workers", name: "Worker Performance", icon: UserCheck },
      ],
    },
    {
      path: "/system",
      name: "System",
      icon: Settings,
      category: "system",
      children: [
        {
          path: "/system/sessions",
          name: "Session Management",
          icon: CalendarDays,
        },
        { path: "/audit", name: "Audit Trail", icon: ScrollText },
        {
          path: "/notification-logs",
          name: "Notify Log's",
          icon: Bell,
        },
        {
          path: "/system/settings",
          name: "Farm Management Settings",
          icon: Sprout,
        },
      ],
    },
  ];

  const filteredMenu = menuItems
    .map((item) => {
      if (item.children) {
        const children = item.children.filter(
          (child) => !(child.path === "/users"),
        );
        return { ...item, children };
      }
      return item;
    })
    .filter(
      (item) =>
        item.path !== "/users" &&
        (item.children ? item.children.length > 0 : true),
    );

  const toggleDropdown = (name: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isActivePath = (path: string) => location.pathname === path;
  const isDropdownActive = (items: MenuItem[] = []) =>
    items.some((item) => isActivePath(item.path));

  useEffect(() => {
    filteredMenu.forEach((item) => {
      if (item.children && isDropdownActive(item.children)) {
        setOpenDropdowns((prev) => ({ ...prev, [item.name]: true }));
      }
    });
  }, [location.pathname]);

  const renderMenuItems = (items: MenuItem[]) => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      const isActive = hasChildren
        ? isDropdownActive(item.children)
        : isActivePath(item.path);
      const isOpenDropdown = openDropdowns[item.name];

      return (
        <li key={item.path || item.name} className="mb-1 w-full">
          {hasChildren ? (
            <>
              {/* Parent item (dropdown toggle) */}
              <div
                onClick={() => toggleDropdown(item.name)}
                className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer w-full
                  ${
                    isActive
                      ? "bg-[var(--primary-color)] text-white shadow-md"
                      : "text-[var(--sidebar-text)] hover:bg-[var(--primary-color)] hover:text-white"
                  }
                  ${!isOpen ? "justify-center" : "justify-between"}
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`w-5 h-5 ${
                      isActive
                        ? "text-white"
                        : "text-[var(--sidebar-text)] group-hover:text-white"
                    }`}
                  />
                  {isOpen && <span className="font-medium">{item.name}</span>}
                </div>
                {isOpen && (
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isOpenDropdown ? "rotate-180" : ""
                    } ${
                      isActive
                        ? "text-white"
                        : "text-[var(--sidebar-text)] group-hover:text-white"
                    }`}
                  />
                )}
              </div>

              {/* Submenu */}
              <div
                className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                  isOpenDropdown ? "max-h-96" : "max-h-0"
                }`}
              >
                {isOpen ? (
                  <ul
                    className="ml-4 border-l-2 pl-3 mt-1 space-y-1"
                    style={{ borderColor: "var(--primary-color)" }}
                  >
                    {item.children?.map((child) => {
                      const isChildActive = isActivePath(child.path);
                      return (
                        <li key={child.path} className="w-full">
                          <Link
                            to={child.path}
                            className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm w-full
                              ${
                                isChildActive
                                  ? "text-[var(--sidebar-text)] bg-[var(--primary-color)]/20 font-semibold"
                                  : "text-[var(--sidebar-text)] hover:bg-[var(--primary-color)] hover:text-white"
                              }
                            `}
                          >
                            <child.icon
                              className={`w-4 h-4 ${
                                isChildActive
                                  ? "text-[var(--sidebar-text)]"
                                  : "text-[var(--sidebar-text)] group-hover:text-white"
                              }`}
                            />
                            <span>{child.name}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--primary-color)]"></div>
                    <ul className="flex flex-col items-center space-y-1 mt-1">
                      {item.children?.map((child) => {
                        const isChildActive = isActivePath(child.path);
                        return (
                          <li key={child.path} className="w-full">
                            <Link
                              to={child.path}
                              className={`group flex items-center justify-center gap-3 px-3 py-2 ml-3 rounded-lg transition-all duration-200 text-sm w-[calc(100%-12px)]
                                ${
                                  isChildActive
                                    ? "text-[var(--sidebar-text)] bg-[var(--primary-color)]/20 font-semibold"
                                    : "text-[var(--sidebar-text)] hover:bg-[var(--primary-color)] hover:text-white"
                                }
                              `}
                            >
                              <child.icon
                                className={`w-4 h-4 ${
                                  isChildActive
                                    ? "text-[var(--sidebar-text)]"
                                    : "text-[var(--sidebar-text)] group-hover:text-white"
                                }`}
                              />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to={item.path}
              className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 w-full
                ${
                  isActive
                    ? "bg-[var(--primary-color)] text-white shadow-md"
                    : "text-[var(--sidebar-text)] hover:bg-[var(--primary-color)] hover:text-white"
                }
                ${!isOpen ? "justify-center" : "justify-between"}
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={`w-5 h-5 ${
                    isActive
                      ? "text-white"
                      : "text-[var(--sidebar-text)] group-hover:text-white"
                  }`}
                />
                {isOpen && <span className="font-medium">{item.name}</span>}
              </div>
              {isOpen && (
                <ChevronRight
                  className={`w-4 h-4 transition-opacity duration-200 ${
                    isActive
                      ? "opacity-100 text-white"
                      : "opacity-0 group-hover:opacity-50 text-[var(--sidebar-text)]"
                  }`}
                />
              )}
            </Link>
          )}
        </li>
      );
    });
  };

  const categories = [
    { id: "core", name: "Core Operations" },
    { id: "inventory", name: "Inventory Management" },
    { id: "taxes", name: "Tax Management" },
    { id: "analytics", name: "Analytics & Reports" },
    { id: "customers", name: "Customers" },
    { id: "system", name: "System" },
  ];

  return (
    <div
      className={`
        fixed md:relative inset-y-0 left-0
        bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]
        rounded-r-3xl shadow-xl
        transform transition-all duration-300 ease-in-out
        z-30 flex flex-col h-screen
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        md:${isOpen ? "w-64" : "w-20"}
      `}
    >
      {/* Header */}
      <div className="flex-shrink-0 border-b border-[var(--sidebar-border)] bg-[var(--card-bg)] p-6">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
            <img
              src={"./icon.png"}
              alt="Stashify Logo"
              className="h-full w-full object-cover"
            />
          </div>
          {isOpen && (
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-[var(--sidebar-text)]">
                {title}
              </h2>
              <p className="text-xs text-[var(--sidebar-text)]">
                Business Management
              </p>
              <p className="text-xs text-[var(--sidebar-text)]">{currency}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto sidebar-scrollbar p-4">
        {categories.map((category) => {
          const categoryItems = filteredMenu.filter(
            (item) => item.category === category.id,
          );
          if (categoryItems.length === 0) return null;

          return (
            <div key={category.id} className="mb-6">
              {isOpen && (
                <h6 className="px-4 py-2 text-xs font-semibold text-[var(--sidebar-text)] uppercase tracking-wider">
                  {category.name}
                </h6>
              )}
              <ul className="space-y-1">{renderMenuItems(categoryItems)}</ul>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--sidebar-border)] text-center flex-shrink-0">
        {isOpen ? (
          <p className="text-xs text-[var(--sidebar-text)]">
            {version} • © {new Date().getFullYear()} Stashify
          </p>
        ) : (
          <p className="text-xs text-[var(--sidebar-text)]">
            © {new Date().getFullYear()}
          </p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;