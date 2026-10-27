import { Link } from "react-router-dom";

export default function PropertyCard({ property }) {
    return (
        <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, background: "white" }}>
            <h3 style={{ marginBottom: 8 }}>{property.title}</h3>
            <p style={{ color: "#666", marginBottom: 8 }}>
                {property.location?.city} {property.location?.area && `, ${property.location.area}`}
            </p>
            <p style={{ fontWeight: "bold", color: "#007bff", fontSize: 20, marginBottom: 8 }}>
                PKR {property.price.toLocaleString()}
            </p>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <span style={{ background: "#eee", padding: "4px 8px", borderRadius: 4, fontSize: 12 }}>
                    {property.propertyType}
                </span>
                <span style={{ background: "#eee", padding: "4px 8px", borderRadius: 4, fontSize: 12 }}>
                    For {property.purpose}
                </span>
                {property.bedrooms > 0 && (
                    <span style={{ background: "#eee", padding: "4px 8px", borderRadius: 4, fontSize: 12 }}>
                        {property.bedrooms} Beds
                    </span>
                )}
            </div>
            <Link
                to={`/properties/${property._id}`}
                style={{ display: "block", textAlign: "center", background: "#007bff", color: "white", padding: 10, borderRadius: 4, textDecoration: "none" }}
            >
                View Details
            </Link>
        </div>
    );
}