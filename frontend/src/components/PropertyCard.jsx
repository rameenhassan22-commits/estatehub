import { Link } from "react-router-dom";
import { Bed, Maximize2, MapPin, Home, Building, Trees, Store } from "lucide-react";
import Badge from "./ui/Badge";
import { formatPrice, capitalize } from "../lib/format";

const TYPE_ICON = { house: Home, apartment: Building, plot: Trees, commercial: Store };

export default function PropertyCard({ property, showStatus = false }) {
  const Icon = TYPE_ICON[property.propertyType] || Home;
  const place = [property.location?.area, property.location?.city].filter(Boolean).join(", ");
  const agency = property.tenantId?.name;

  return (
    <Link
      to={`/properties/${property._id}`}
      className="group card flex flex-col overflow-hidden transition duration-200 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-900/15"
    >
      {/* No photo upload yet -> a branded placeholder. Replace with <img> when you add image uploads. */}
      <div className="relative flex h-40 items-center justify-center border-b border-brand-100 bg-linear-to-br from-brand-100 via-brand-50 to-sand-100">
        <Icon size={56} className="text-brand-600/40 transition group-hover:scale-110" strokeWidth={1.4} />
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand-800 shadow-sm">
          For {property.purpose}
        </span>
        {showStatus && <Badge value={property.status} className="absolute top-3 right-3 bg-white" />}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="font-display text-xl font-bold text-brand-800">{formatPrice(property.price)}</p>
        <h3 className="mt-1 line-clamp-2 font-semibold text-slate-900">{property.title}</h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin size={14} className="shrink-0" /> {place || "Location not set"}
        </p>

        <div className="mt-4 flex items-center gap-4 border-t border-slate-200 pt-3 text-sm text-slate-600">
          <span className="font-medium">{capitalize(property.propertyType)}</span>
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bed size={15} /> {property.bedrooms}
            </span>
          )}
          {property.area > 0 && (
            <span className="flex items-center gap-1">
              <Maximize2 size={14} /> {property.area}
            </span>
          )}
        </div>
        {agency && <p className="mt-2 truncate text-xs text-slate-400">Listed by {agency}</p>}
      </div>
    </Link>
  );
}