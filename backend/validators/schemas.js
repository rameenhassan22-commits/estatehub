import { z } from "zod";

// ---------- reusable building blocks ----------
const text = (label, { min = 1, max = 120 } = {}) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(min, min === 1 ? `${label} is required` : `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`);

const email = z
  .string({ error: "Email is required" })
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address"));

const password = z
  .string({ error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .max(64, "Password must be at most 64 characters")
  .regex(/[a-z]/, "Password needs a lowercase letter")
  .regex(/[A-Z]/, "Password needs an uppercase letter")
  .regex(/[0-9]/, "Password needs a number");

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

// "" (empty input from a form / query-string) -> undefined, so optional() works
const blankToUndefined = (schema) =>
  z.preprocess((v) => (v === "" || v === null ? undefined : v), schema.optional());

// ---------- auth ----------
export const registerCustomerSchema = z
  .object({ name: text("Full name", { min: 2, max: 60 }), email, password })
  .strict();

export const registerAgencySchema = z
  .object({
    agencyName: text("Agency name", { min: 2, max: 80 }),
    name: text("Your name", { min: 2, max: 60 }),
    email,
    password,
  })
  .strict();

export const loginSchema = z
  .object({
    email,
    password: z.string({ error: "Password is required" }).min(1, "Password is required"),
  })
  .strict();

// ---------- users (agency_admin manages team) ----------
export const createAgencyUserSchema = z
  .object({
    name: text("Full name", { min: 2, max: 60 }),
    email,
    password,
    role: z.enum(["agency_admin", "agent"], { error: "Role must be agency_admin or agent" }),
  })
  .strict();

export const updateAgencyUserSchema = z.object({ isActive: z.boolean() }).strict();

// ---------- properties ----------
export const PROPERTY_TYPES = ["house", "apartment", "plot", "commercial"];
export const PROPERTY_STATUSES = ["available", "sold", "rented", "draft"];

const propertyBase = z
  .object({
    title: text("Title", { min: 5, max: 120 }),
    description: z.string().trim().max(2000, "Description must be at most 2000 characters").optional(),
    price: z.coerce.number({ error: "Price must be a number" }).positive("Price must be greater than 0"),
    propertyType: z.enum(PROPERTY_TYPES, { error: "Pick a property type" }),
    purpose: z.enum(["sale", "rent"], { error: "Pick sale or rent" }),
    location: z
      .object({
        city: text("City", { min: 2, max: 60 }),
        area: z.string().trim().max(80).optional(),
        address: z.string().trim().max(200).optional(),
      })
      .strict(),
    bedrooms: z.coerce.number().int("Bedrooms must be a whole number").min(0).max(20).optional(),
    area: z.coerce.number().min(0).max(1_000_000).optional(),
    status: z.enum(PROPERTY_STATUSES).optional(),
  })
  // .strict() blocks "mass assignment": a client cannot sneak in tenantId, createdBy, etc.
  .strict();

export const createPropertySchema = propertyBase;
export const updatePropertySchema = propertyBase.partial();

export const SORT_OPTIONS = ["-createdAt", "createdAt", "price", "-price"];

export const listPropertiesQuerySchema = z.object({
  q: blankToUndefined(z.string().trim().max(80)),
  sort: blankToUndefined(z.enum(SORT_OPTIONS)).default("-createdAt"),
  page: blankToUndefined(z.coerce.number().int().min(1)).default(1),
  limit: blankToUndefined(z.coerce.number().int().min(1).max(50)).default(9),
  propertyType: blankToUndefined(z.enum(PROPERTY_TYPES)),
  purpose: blankToUndefined(z.enum(["sale", "rent"])),
  status: blankToUndefined(z.enum(PROPERTY_STATUSES)),
  minPrice: blankToUndefined(z.coerce.number().min(0)),
  maxPrice: blankToUndefined(z.coerce.number().min(0)),
  city: blankToUndefined(z.string().trim().max(60)),
  agency: blankToUndefined(z.string().trim().toLowerCase().max(100)), // tenant slug -> URL-path tenancy
  scope: blankToUndefined(z.enum(["agency"])), // "agency" = only my agency's listings (dashboard)
});

// ---------- inquiries ----------
export const createInquirySchema = z
  .object({
    propertyId: objectId,
    message: text("Message", { min: 10, max: 1000 }),
  })
  .strict();

export const updateInquirySchema = z
  .object({ status: z.enum(["new", "contacted", "closed"], { error: "Invalid status" }) })
  .strict();

// ---------- super admin ----------
export const updateTenantSchema = z
  .object({ status: z.enum(["active", "inactive", "pending"], { error: "Invalid status" }) })
  .strict();

export const idParamSchema = z.object({ id: objectId });