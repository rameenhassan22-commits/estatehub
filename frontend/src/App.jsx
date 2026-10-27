import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Properties from "./pages/Properties"; // <-- IMPORT THIS

const Dashboard = () => <h1>Agency Dashboard</h1>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<h1>Register Page (Coming Soon)</h1>} />
          
          {/* Use the new Properties component */}
          <Route path="/" element={<Properties />} /> {/* <-- UPDATE THIS */}

          <Route path="/dashboard" element={
            <ProtectedRoute roles={["agency_admin", "agent"]}>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}