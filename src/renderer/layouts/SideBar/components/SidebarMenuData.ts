// src/layouts/components/SidebarMenuData.ts
import {
  LayoutDashboard,
  Users, Settings,
  Bell, ClipboardList,
  DollarSign, CalendarDays,
  ScrollText,
  Sprout,
  LineChart,
  UserCheck,
  Wheat,
  PieChart,
  BarChart2,
  Banknote,
  FileClock,
  HandCoins,
  Receipt,
  Scroll,
  Trees,
  Users2,
  Map
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface MenuItem {
  path: string;
  name: string;
  icon: LucideIcon;
  category?: string;
  children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
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
    children: [{ path: "/workers", name: "Worker Directory", icon: Users2 }],
  },
  {
    path: "",
    name: "Payroll & Finance",
    icon: DollarSign,
    category: "core",
    children: [
      {
        path: "/finance/worker/payments",
        name: "Worker Payments",
        icon: HandCoins,
      },
      // { path: "/finance/payments", name: "Payments", icon: Banknote },
      { path: "/finance/debts", name: "Debt Management", icon: Receipt },
      {
        path: "/finance/payment/history",
        name: "Payment History",
        icon: FileClock,
      },
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
      {
        path: "/analytics/workers",
        name: "Worker Performance",
        icon: UserCheck,
      },
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
        path: "/reminders",
        name: "Reminder Log's",
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

export const categories = [
  { id: "core", name: "Core Operations" },
  { id: "inventory", name: "Inventory Management" },
  { id: "taxes", name: "Tax Management" },
  { id: "analytics", name: "Analytics & Reports" },
  { id: "customers", name: "Customers" },
  { id: "system", name: "System" },
];
