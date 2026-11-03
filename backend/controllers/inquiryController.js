import Inquiry from "../models/Inquiry.js";
import Property from "../models/Property.js";
import { inquiryScopeFor as scopeFor } from "../utils/inquiryScope.js";
import { emitToRooms } from "../realtime/socket.js";
import User from "../models/User.js";
import { sendMail, sendInBackground } from "../utils/mailer.js";
import { newInquiryEmail } from "../utils/emailTemplates.js";

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

  // REAL-TIME: tell the listing's owner and the agency admins right now (Socket.IO rooms = tenant isolation)
  emitToRooms([`user:${property.createdBy}`, `admins:${property.tenantId}`], "inquiry:new", {
    inquiryId: inquiry._id,
    propertyId: property._id,
    propertyTitle: property.title,
    customerName: req.user.name,
    message: message.slice(0, 120),
    createdAt: inquiry.createdAt,
  });
  // EMAIL: also notify the listing owner (background - a mail problem must not fail the inquiry)
  const owner = await User.findById(property.createdBy).select("name email");
  if (owner) {
    sendInBackground(
      sendMail({
        to: owner.email,
        ...newInquiryEmail({ recipientName: owner.name, customerName: req.user.name, propertyTitle: property.title, message }),
      })
    );
  }
  res.status(201).json(inquiry);
};

// 2. GET /api/inquiries  (what you get depends on your role - see scopeFor)
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
  const filter = { ...(await scopeFor(req.user)), _id: req.params.id };

  const inquiry = await Inquiry.findOneAndUpdate(filter, { status: req.body.status }, { new: true });
  if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

  // REAL-TIME: the customer who sent it sees the new status without refreshing
  const property = await Property.findById(inquiry.propertyId).select("title");
  emitToRooms(`user:${inquiry.customerId}`, "inquiry:updated", {
    inquiryId: inquiry._id,
    status: inquiry.status,
    propertyTitle: property?.title,
  });

  res.json(inquiry);
};