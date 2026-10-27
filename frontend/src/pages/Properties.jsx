import { useEffect, useState } from "react";
import { api } from "../api/axios";
import PropertyCard from "../components/PropertyCard";

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [sort, setSort] = useState("-createdAt");

  // Fetch properties whenever filters change
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/properties", {
          params: { q: search, propertyType: type, purpose, sort }
        });
        setProperties(data.items);
        setError("");
      } catch (err) {
        setError("Failed to load properties");
      } finally {
        setLoading(false);
      }
    };

    // Small delay to prevent too many API calls while typing
    const timer = setTimeout(() => fetchProperties(), 300);
    return () => clearTimeout(timer);
  }, [search, type, purpose, sort]);

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 24 }}>Browse Properties</h1>

      {/* Filter Bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <input 
          placeholder="Search by city, area, or title..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All Types</option>
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="plot">Plot</option>
          <option value="commercial">Commercial</option>
        </select>

        <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
          <option value="">Sale or Rent</option>
          <option value="sale">For Sale</option>
          <option value="rent">For Rent</option>
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="-createdAt">Newest First</option>
          <option value="price">Price: Low to High</option>
          <option value="-price">Price: High to Low</option>
        </select>
      </div>

      {/* Results */}
      {loading ? (
        <p>Loading properties...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : properties.length === 0 ? (
        <p>No properties found matching your criteria.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {properties.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}