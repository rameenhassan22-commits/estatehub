import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Properties from "./pages/Properties";
import AgencyDashboard from "./pages/AgencyDashboard";
import PropertyForm from "./pages/PropertyForm";
import PropertyDetail from "./pages/PropertyDetail";
import Inquiries from "./pages/Inquiries";
import RegisterCustomer from "./pages/RegisterCustomer"; // <-- IMPORT
import RegisterAgency from "./pages/RegisterAgency"; // <-- IMPORT

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register-customer" element={<RegisterCustomer />} />
          <Route path="/register-agency" element={<RegisterAgency />} />

          {/* Public Browse Routes */}
          <Route path="/" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />

          {/* Agency Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={["agency_admin", "agent"]}>
              <AgencyDashboard />
            </ProtectedRoute>
          } />
          <Route path="/properties/new" element={
            <ProtectedRoute roles={["agency_admin", "agent"]}>
              <PropertyForm />
            </ProtectedRoute>
          } />
          <Route path="/properties/:id/edit" element={
            <ProtectedRoute roles={["agency_admin", "agent"]}>
              <PropertyForm />
            </ProtectedRoute>
          } />
          <Route path="/inquiries" element={
            <ProtectedRoute roles={["agency_admin", "agent"]}>
              <Inquiries />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}