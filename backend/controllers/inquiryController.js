import Inquiry from "../models/Inquiry.js";
import Property from "../models/Property.js";
import { inquiryScopeFor as scopeFor } from "../utils/inquiryScope.js";

// 1. POST /api/inquiries (customer only)
export const createInquiry = async (req, res) => {
  const { propertyId, message } = req.body;

  const property = await Property.findById(propertyId);
  if (!property || property.status !== "available") {
    return res.status(404).json({ message: "Property not found or no longer available" });
  }

  const inquiry = await Inquiry.create({
    tenantId: property.tenantId, // copied from the property, never from the client
    propertyId,
    customerId: req.user._id,
    message,
  });

  // (Step 17 adds a real-time notification here, Step 18 adds an email)
  res.status(201).json(inquiry);
};

// 2. GET /api/inquiries (what you get depends on your role)
export const listInquiries = async (req, res) => {
  const filter = await scopeFor(req.user);

  const items = await Inquiry.find(filter)
    .populate("propertyId", "title price status")
    .populate("customerId", "name email")
    .populate("tenantId", "name slug")
    .sort("-createdAt");

  res.json(items);
};

// 3. PATCH /api/inquiries/:id (agency_admin, agent)
export const updateInquiryStatus = async (req, res) => {
  // The same scope rule applies: you can only change inquiries you are allowed to see
  const filter = { ...(await scopeFor(req.user)), _id: req.params.id };

  const inquiry = await Inquiry.findOneAndUpdate(filter, { status: req.body.status }, { new: true });
  if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

  res.json(inquiry);
};