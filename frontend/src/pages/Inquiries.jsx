import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInquiries = async () => {
    try {
      const { data } = await api.get("/inquiries");
      setInquiries(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/inquiries/${id}`, { status: newStatus });
      // Update local state without re-fetching everything
      setInquiries((prev) => 
        prev.map((inq) => inq._id === id ? { ...inq, status: newStatus } : inq)
      );
    } catch (error) {
      alert("Failed to update status");
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <h1>Agency Inbox</h1>
      <p style={{ marginBottom: 24 }}>Manage inquiries from potential buyers and renters.</p>

      {loading ? (
        <p>Loading inquiries...</p>
      ) : inquiries.length === 0 ? (
        <p>No inquiries yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {inquiries.map((inquiry) => (
            <div key={inquiry._id} style={{ background: "white", padding: 20, borderRadius: 8, border: "1px solid #ddd" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0 }}>{inquiry.propertyId?.title || "Unknown Property"}</h3>
                  <p style={{ color: "#666", margin: "4px 0" }}>
                    From: {inquiry.customerId?.name} ({inquiry.customerId?.email})
                  </p>
                </div>
                
                <select 
                  value={inquiry.status} 
                  onChange={(e) => handleStatusChange(inquiry._id, e.target.value)}
                  style={{ 
                    height: 40, 
                    background: inquiry.status === "new" ? "#fff3cd" : inquiry.status === "closed" ? "#d4edda" : "white",
                    fontWeight: "bold"
                  }}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <p style={{ background: "#f9f9f9", padding: 12, borderRadius: 4 }}>
                "{inquiry.message}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}