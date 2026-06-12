import { Navigate, Route, Routes } from "react-router-dom";
import PageNotFound from "../components/Shared/PageNotFound";
import ProtectedRoute from "../app/ProtectedRoute";
import Layout from "../layouts/Layout";
import { LicenseModal } from "../components/Shared/LicenseModal";
import { useEffect, useState } from "react";
import { Help } from "../pages/help";
import Dashboard from "../pages/dashboard";

// Import our implemented pages
import BukidPage from "../pages/farms/bukid";
import PitakPage from "../pages/farms/pitak";
import AssignmentsPage from "../pages/farms/assignments";
import WorkersPage from "../pages/workers";
import WorkerPaymentsPage from "../pages/finance/worker-payments";
import DebtsPage from "../pages/finance/debts";
import NotificationsPage from "../pages/notifications";
import NotificationLogsPage from "../pages/notification-logs";
import AuditPage from "../pages/audit";
import FarmManagementSettingsPage from "../pages/settings";

function App() {
  const [licenseAccepted, setLicenseAccepted] = useState(false);

  useEffect(() => {
    if (window.backendAPI?.notifyAppReady) {
      window.backendAPI.notifyAppReady();
      console.log("Notified main process: renderer is ready");
    }
  }, []);

  const handleAccept = () => {
    setLicenseAccepted(true);
  };

  const handleCommercialRequest = () => {
    if ((window as any).backendAPI?.openExternal) {
      (window as any).backendAPI.openExternal(
        "mailto:cyberarcenal1@gmail.com?subject=Commercial%20License%20Inquiry",
      );
    } else {
      window.open(
        "mailto:cyberarcenal1@gmail.com?subject=Commercial%20License%20Inquiry",
        "_blank",
      );
    }
  };

  if (!licenseAccepted && !localStorage.getItem("Debtify_license_accepted")) {
    return (
      <LicenseModal
        onAccept={handleAccept}
        onCommercialRequest={handleCommercialRequest}
      />
    );
  }

  return (
    <Routes>
      <Route path="/help" element={<Help />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Farm & Plot */}
        <Route path="/farms/bukid" element={<BukidPage />} />
        <Route path="/farms/pitak" element={<PitakPage />} />
        <Route path="/farms/assignments" element={<AssignmentsPage />} />

        {/* Workers */}
        <Route path="/workers" element={<WorkersPage />} />

        {/* Payroll & Finance */}
        <Route path="/finance/worker/payments" element={<WorkerPaymentsPage />} />
        <Route path="/finance/payments" element={<WorkerPaymentsPage />} />
        <Route path="/finance/debts" element={<DebtsPage />} />

        {/* Notifications & Logs */}
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/notification-logs" element={<NotificationLogsPage />} />

        {/* System */}
        <Route path="/audit" element={<AuditPage />} />
        <Route path="/system/settings" element={<FarmManagementSettingsPage />} />

        {/* 404 */}
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
}

export default App;