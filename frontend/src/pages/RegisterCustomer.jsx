import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function RegisterCustomer() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth(); // We'll log them in automatically after registering

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/register-customer", formData);
      
      // Auto-login after successful registration
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Redirect to homepage
      window.location.href = "/"; 
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", padding: 20, background: "white", borderRadius: 8, border: "1px solid #ddd" }}>
      <h2>Create a Customer Account</h2>
      <p style={{ color: "#666", marginBottom: 20 }}>Sign up to save properties and contact agencies.</p>
      
      {error && <p style={{ color: "red", marginBottom: 10 }}>{error}</p>}
      
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input 
          type="text" 
          placeholder="Full Name" 
          value={formData.name} 
          onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
          required 
        />
        <input 
          type="email" 
          placeholder="Email Address" 
          value={formData.email} 
          onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password (min 6 characters)" 
          value={formData.password} 
          onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
          required 
          minLength="6"
        />
        <button type="submit" disabled={loading} style={{ padding: 10, background: "#28a745", color: "white", border: "none", cursor: "pointer", borderRadius: 4 }}>
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>
      
      <p style={{ marginTop: 16, textAlign: "center" }}>
        Already have an account? <Link to="/login" style={{ color: "#007bff" }}>Log in</Link>
      </p>
    </div>
  );
}