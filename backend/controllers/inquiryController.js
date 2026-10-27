import Inquiry from "../models/Inquiry.js";
import Property from "../models/Property.js";

// 1. POST /api/inquiries (Customer only)
export const createInquiry = async (req, res) => {
  try {
    const { propertyId, message } = req.body;
    
    // Check if the property exists
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: "Property not found" });

    const inquiry = await Inquiry.create({
      tenantId: property.tenantId, // <-- Automatically grab the tenantId from the property
      propertyId,
      customerId: req.user._id,
      message,
    });
    
    res.status(201).json(inquiry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. GET /api/inquiries
export const listInquiries = async (req, res) => {
  try {
    let filter = {};

    // TENANT ISOLATION: 
    // Customers only see their own inquiries.
    // Agency staff only see inquiries for their agency.
    if (req.user.role === "customer") {
      filter = { customerId: req.user._id };
    } else {
      filter = { tenantId: req.user.tenantId };
    }

    const items = await Inquiry.find(filter)
      .populate("propertyId", "title price") // Show property details
      .populate("customerId", "name email")  // Show customer details
      .sort("-createdAt");
      
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. PATCH /api/inquiries/:id (Agency Admin & Agent only)
export const updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!["new", "contacted", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Find the inquiry AND ensure it belongs to the user's tenant
    const inquiry = await Inquiry.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      { status },
      { new: true }
    );

    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });
    
    res.json(inquiry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};