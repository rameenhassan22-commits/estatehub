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

import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Stub from "./pages/Stub";

export default function App() {
  const dispatch = useDispatch();
  const hasToken = useSelector((s) => Boolean(s.auth.token));

  // On first load: if a token was saved, ask the server who it belongs to (and whether it is still valid)
  useEffect(() => {
    if (hasToken) dispatch(fetchMe());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Routes>
        {/* 1. Auth pages: split-screen layout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register-customer" element={<Stub title="Register as customer" step={13} />} />
          <Route path="/register-agency" element={<Stub title="Register your agency" step={13} />} />
        </Route>

        {/* 2. Public site: navbar + footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Stub title="Home" step={14} />} />
          <Route path="/properties" element={<Stub title="Browse properties" step={14} />} />
          <Route path="/properties/:id" element={<Stub title="Property detail" step={14} />} />
          <Route path="/agency/:slug" element={<Stub title="Agency page" step={14} />} />

          {/* customer only */}
          <Route element={<ProtectedRoute roles={[ROLES.CUSTOMER]} />}>
            <Route path="/my-inquiries" element={<Stub title="My inquiries" step={16} />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>

        {/* 3. Agency workspace: sidebar layout, staff only */}
        <Route element={<ProtectedRoute roles={STAFF_ROLES} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Stub title="Dashboard overview" step={15} />} />
            <Route path="/dashboard/properties" element={<Stub title="Manage properties" step={15} />} />
            <Route path="/dashboard/properties/new" element={<Stub title="Add property" step={15} />} />
            <Route path="/dashboard/properties/:id/edit" element={<Stub title="Edit property" step={15} />} />
            <Route path="/dashboard/inquiries" element={<Stub title="Inbox" step={16} />} />

            {/* agency admin only (agents get the 403 page) */}
            <Route element={<ProtectedRoute roles={[ROLES.AGENCY_ADMIN]} />}>
              <Route path="/dashboard/team" element={<Stub title="Team" step={15} />} />
            </Route>
          </Route>
        </Route>

        {/* 4. Platform owner */}
        <Route element={<ProtectedRoute roles={[ROLES.SUPER_ADMIN]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<Stub title="Platform overview" step={16} />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}