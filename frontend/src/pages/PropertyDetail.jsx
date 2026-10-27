import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function PropertyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Inquiry form state
  const [message, setMessage] = useState("");
  const [inquiryStatus, setInquiryStatus] = useState(""); // success or error message

  useEffect(() => {
    api.get(`/properties/${id}`)
      .then(({ data }) => setProperty(data))
      .catch(() => alert("Property not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setInquiryStatus("Sending...");
    
    try {
      await api.post("/inquiries", { propertyId: id, message });
      setInquiryStatus("✅ Inquiry sent successfully! The agency will contact you soon.");
      setMessage(""); // Clear the textarea
    } catch (error) {
      setInquiryStatus("❌ " + (error.response?.data?.message || "Failed to send inquiry"));
    }
  };

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;
  if (!property) return <p style={{ padding: 24 }}>Property not found.</p>;

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <Link to="/" style={{ display: "inline-block", marginBottom: 16 }}>← Back to Properties</Link>
      
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>{property.title}</h1>
      <p style={{ color: "#666", fontSize: 18, marginBottom: 16 }}>
        {property.location?.city} {property.location?.area && `, ${property.location.area}`}
      </p>
      
      <h2 style={{ color: "#007bff", marginBottom: 16 }}>
        PKR {property.price.toLocaleString()}
      </h2>

      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <span style={{ background: "#eee", padding: "4px 8px", borderRadius: 4 }}>
          {property.propertyType}
        </span>
        <span style={{ background: "#eee", padding: "4px 8px", borderRadius: 4 }}>
          For {property.purpose}
        </span>
        <span style={{ background: "#eee", padding: "4px 8px", borderRadius: 4 }}>
          Status: {property.status}
        </span>
        {property.bedrooms > 0 && (
          <span style={{ background: "#eee", padding: "4px 8px", borderRadius: 4 }}>
            {property.bedrooms} Bedrooms
          </span>
        )}
      </div>

      <div style={{ marginBottom: 32, lineHeight: 1.6 }}>
        <h3>Description</h3>
        <p>{property.description || "No description provided."}</p>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "32px 0" }} />

      {/* Inquiry Section */}
      <div style={{ background: "white", padding: 24, borderRadius: 8, border: "1px solid #ddd" }}>
        <h3>Interested in this property?</h3>
        
        {!user ? (
          <p>
            Please <Link to="/login" style={{ color: "#007bff" }}>log in as a customer</Link> to send an inquiry.
          </p>
        ) : user.role !== "customer" ? (
          <p style={{ color: "#666" }}>Only customers can send inquiries.</p>
        ) : (
          <form onSubmit={handleInquirySubmit} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
            <textarea 
              placeholder="Hi, I am interested in this property..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows="4"
            />
            <button type="submit" style={{ padding: 10, background: "#28a745", color: "white", border: "none", cursor: "pointer", borderRadius: 4 }}>
              Send Inquiry
            </button>
            {inquiryStatus && <p style={{ fontWeight: "bold" }}>{inquiryStatus}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
