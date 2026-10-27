import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Properties from "./pages/Properties";
import AgencyDashboard from "./pages/AgencyDashboard";
import PropertyForm from "./pages/PropertyForm";
import PropertyDetail from "./pages/PropertyDetail"; // <-- IMPORT
import Inquiries from "./pages/Inquiries"; // <-- IMPORT

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Properties />} />
          
          {/* Public Property Details */}
          <Route path="/properties/:id" element={<PropertyDetail />} />

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

          {/* Agency Inbox */}
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