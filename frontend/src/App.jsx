import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import { fetchMe } from "./features/auth/authSlice";
import { ROLES, STAFF_ROLES } from "./lib/roles";

import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

import Home from "./pages/Home";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import AgencyPage from "./pages/AgencyPage";
import Login from "./pages/Login";
import RegisterCustomer from "./pages/RegisterCustomer";
import RegisterAgency from "./pages/RegisterAgency";
import Inquiries from "./pages/Inquiries";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Overview from "./pages/dashboard/Overview";
import ManageProperties from "./pages/dashboard/ManageProperties";
import PropertyForm from "./pages/dashboard/PropertyForm";
import Team from "./pages/dashboard/Team";
import { useRealtime } from "./hooks/useRealtime";
import InfoPage from "./pages/InfoPage";

export default function App() {
  const dispatch = useDispatch();
  const hasToken = useSelector((s) => Boolean(s.auth.token));

  // On first load: if a token was saved, ask the server who it belongs to (and whether it is still valid)
  useEffect(() => {
    if (hasToken) dispatch(fetchMe());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useRealtime(); // Socket.IO: live inquiry notifications while logged in

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Routes>
        {/* 1. Auth pages: split-screen layout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register-customer" element={<RegisterCustomer />} />
          <Route path="/register-agency" element={<RegisterAgency />} />
        </Route>

        {/* 2. Public site: navbar + footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/agency/:slug" element={<AgencyPage />} />
          <Route path="/contact" element={<InfoPage />} />
          <Route path="/privacy" element={<InfoPage />} />
          <Route path="/terms" element={<InfoPage />} />

          {/* customer only */}
          <Route element={<ProtectedRoute roles={[ROLES.CUSTOMER]} />}>
            <Route path="/my-inquiries" element={<Inquiries />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>

        {/* 3. Agency workspace: sidebar layout, staff only */}
        <Route element={<ProtectedRoute roles={STAFF_ROLES} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Overview />} />
            <Route path="/dashboard/properties" element={<ManageProperties />} />
            <Route path="/dashboard/properties/new" element={<PropertyForm />} />
            <Route path="/dashboard/properties/:id/edit" element={<PropertyForm />} />
            <Route path="/dashboard/inquiries" element={<Inquiries />} />

            {/* agency admin only (agents get the 403 page) */}
            <Route element={<ProtectedRoute roles={[ROLES.AGENCY_ADMIN]} />}>
              <Route path="/dashboard/team" element={<Team />} />
            </Route>
          </Route>
        </Route>

        {/* 4. Platform owner */}
        <Route element={<ProtectedRoute roles={[ROLES.SUPER_ADMIN]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}