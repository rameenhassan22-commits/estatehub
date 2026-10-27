import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/axios";

export default function PropertyForm() {
  const { id } = useParams(); // Get ID from URL if we are editing
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    propertyType: "house",
    purpose: "sale",
    bedrooms: 0,
    area: 0,
    city: "",
    areaLocation: "", // Using a different name to avoid conflict with property 'area'
    status: "available",
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState("");

  // If editing, fetch the existing property data to fill the form
  useEffect(() => {
    if (isEditMode) {
      api.get(`/properties/${id}`)
        .then(({ data }) => {
          setFormData({
            title: data.title,
            description: data.description || "",
            price: data.price,
            propertyType: data.propertyType,
            purpose: data.purpose,
            bedrooms: data.bedrooms,
            area: data.area,
            city: data.location?.city || "",
            areaLocation: data.location?.area || "",
            status: data.status,
          });
        })
        .catch(() => setError("Failed to load property data"))
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Format data to match our backend schema
    const payload = {
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      propertyType: formData.propertyType,
      purpose: formData.purpose,
      bedrooms: Number(formData.bedrooms),
      area: Number(formData.area),
      status: formData.status,
      location: {
        city: formData.city,
        area: formData.areaLocation,
      },
    };

    try {
      if (isEditMode) {
        await api.put(`/properties/${id}`, payload);
      } else {
        await api.post("/properties", payload);
      }
      navigate("/dashboard"); // Go back to dashboard on success
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save property");
    }
  };

  if (loading) return <p style={{ padding: 24 }}>Loading form data...</p>;

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <h1>{isEditMode ? "Edit Property" : "Add New Property"}</h1>
      
      {error && <p style={{ color: "red", marginBottom: 16 }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        
        {/* Title */}
        <label>
          Title *
          <input name="title" value={formData.title} onChange={handleChange} required style={{ width: "100%", marginTop: 4 }} />
        </label>

        {/* Description */}
        <label>
          Description
          <textarea name="description" value={formData.description} onChange={handleChange} rows="4" style={{ width: "100%", marginTop: 4 }} />
        </label>

        <div style={{ display: "flex", gap: 16 }}>
          {/* Price */}
          <label style={{ flex: 1 }}>
            Price (PKR) *
            <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" style={{ width: "100%", marginTop: 4 }} />
          </label>

          {/* Status */}
          <label style={{ flex: 1 }}>
            Status
            <select name="status" value={formData.status} onChange={handleChange} style={{ width: "100%", marginTop: 4 }}>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
              <option value="draft">Draft</option>
            </select>
          </label>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          {/* Property Type */}
          <label style={{ flex: 1 }}>
            Property Type *
            <select name="propertyType" value={formData.propertyType} onChange={handleChange} style={{ width: "100%", marginTop: 4 }}>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="plot">Plot</option>
              <option value="commercial">Commercial</option>
            </select>
          </label>

          {/* Purpose */}
          <label style={{ flex: 1 }}>
            Purpose *
            <select name="purpose" value={formData.purpose} onChange={handleChange} style={{ width: "100%", marginTop: 4 }}>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </label>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          {/* Bedrooms */}
          <label style={{ flex: 1 }}>
            Bedrooms
            <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} min="0" style={{ width: "100%", marginTop: 4 }} />
          </label>

          {/* Area Size */}
          <label style={{ flex: 1 }}>
            Area (Sq. Ft. / Marla)
            <input type="number" name="area" value={formData.area} onChange={handleChange} min="0" style={{ width: "100%", marginTop: 4 }} />
          </label>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          {/* City */}
          <label style={{ flex: 1 }}>
            City
            <input name="city" value={formData.city} onChange={handleChange} style={{ width: "100%", marginTop: 4 }} />
          </label>

          {/* Area Location */}
          <label style={{ flex: 1 }}>
            Area / Neighborhood
            <input name="areaLocation" value={formData.areaLocation} onChange={handleChange} style={{ width: "100%", marginTop: 4 }} />
          </label>
        </div>

        <button type="submit" style={{ padding: 12, background: "#007bff", color: "white", border: "none", cursor: "pointer", fontSize: 16, marginTop: 16 }}>
          {isEditMode ? "Update Property" : "Create Property"}
        </button>
      </form>
    </div>
  );
}