import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    propertyType: {
      type: String,
      enum: ["house", "apartment", "plot", "commercial"],
      required: true,
    },
    purpose: { type: String, enum: ["sale", "rent"], required: true },
    location: {
      city: String,
      area: String,
      address: String,
    },
    bedrooms: { type: Number, default: 0 },
    area: { type: Number, default: 0 }, 
    status: {
      type: String,
      enum: ["available", "sold", "rented", "draft"],
      default: "available",
    },
    images: [{ type: String }], 
  },
  { timestamps: true }
);

// Optimizes database queries for filtering and sorting
propertySchema.index({ tenantId: 1, createdAt: -1 });
propertySchema.index({ tenantId: 1, price: 1 });

export default mongoose.model("Property", propertySchema);