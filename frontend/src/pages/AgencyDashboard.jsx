import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function AgencyDashboard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  // Fetch only the properties belonging to this agency
  const fetchProperties = async () => {
    try {
      const { data } = await api.get("/properties");
      setProperties(data.items);
    } catch (error) {
      console.error("Failed to fetch properties", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    try {
      await api.delete(`/properties/${id}`);
      // Refresh list after delete
      setProperties(properties.filter((p) => p._id !== id));
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1>Agency Dashboard</h1>
          <p>Welcome back, {user.name} ({user.role})</p>
        </div>
        <button onClick={logout} style={{ background: "#dc3545", color: "white", border: "none", padding: "10px 20px", borderRadius: 4 }}>
          Logout
        </button>
      </div>

      {/* Actions */}
      <div style={{ marginBottom: 24 }}>
        <Link to="/properties/new" style={{ background: "#28a745", color: "white", padding: "10px 20px", textDecoration: "none", borderRadius: 4 }}>
          + Add New Property
        </Link>
      </div>

      {/* Property List Table */}
      {loading ? (
        <p>Loading your properties...</p>
      ) : properties.length === 0 ? (
        <p>You haven't added any properties yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "white" }}>
          <thead>
            <tr style={{ background: "#f4f4f4", textAlign: "left" }}>
              <th style={{ padding: 12, borderBottom: "1px solid #ddd" }}>Title</th>
              <th style={{ padding: 12, borderBottom: "1px solid #ddd" }}>Price</th>
              <th style={{ padding: 12, borderBottom: "1px solid #ddd" }}>Status</th>
              <th style={{ padding: 12, borderBottom: "1px solid #ddd" }}>Created By</th>
              <th style={{ padding: 12, borderBottom: "1px solid #ddd" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property._id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 12 }}>{property.title}</td>
                <td style={{ padding: 12 }}>PKR {property.price.toLocaleString()}</td>
                <td style={{ padding: 12, textTransform: "capitalize" }}>{property.status}</td>
                <td style={{ padding: 12 }}>{property.createdBy?.name || "Unknown"}</td>
                <td style={{ padding: 12, display: "flex", gap: 8 }}>
                  <Link to={`/properties/${property._id}/edit`} style={{ color: "#007bff" }}>
                    Edit
                  </Link>
                  {/* Only show delete to Agency Admins */}
                  {user.role === "agency_admin" && (
                    <button 
                      onClick={() => handleDelete(property._id)}
                      style={{ color: "red", background: "none", border: "none", cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}