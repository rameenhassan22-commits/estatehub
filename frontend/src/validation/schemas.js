import { z } from "zod";

const email = z
  .string()
  .trim()
  .min(1, "Email is required")
  .pipe(z.email("Enter a valid email address"));

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(64, "Password must be at most 64 characters")
  .regex(/[a-z]/, "Add a lowercase letter")
  .regex(/[A-Z]/, "Add an uppercase letter")
  .regex(/[0-9]/, "Add a number");

const name = (label) =>
  z.string().trim().min(2, `${label} must be at least 2 characters`).max(60, `${label} is too long`);

// "confirm password" only exists in the browser; strip it before calling the API
const withConfirm = (shape) =>
  z.object({ ...shape, confirmPassword: z.string().min(1, "Please confirm your password") }).refine(
    (v) => v.password === v.confirmPassword,
    { path: ["confirmPassword"], message: "Passwords do not match" }
  );

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const registerCustomerSchema = withConfirm({
  name: name("Full name"),
  email,
  password,
});

export const registerAgencySchema = withConfirm({
  agencyName: z.string().trim().min(2, "Agency name must be at least 2 characters").max(80, "Agency name is too long"),
  name: name("Your name"),
  email,
  password,
});

export const teamMemberSchema = z.object({
  name: name("Full name"),
  email,
  password,
  role: z.enum(["agent", "agency_admin"]),
});

export const inquirySchema = z.object({
  message: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters")
    .max(1000, "Message must be at most 1000 characters"),
});

// valueAsNumber gives NaN for an empty box, so the error text must cover that case too
const num = (label) => z.number({ error: `${label} must be a number` });

export const propertySchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(120, "Title is too long"),
  description: z.string().trim().max(2000, "Description is too long"),
  price: num("Price").positive("Price must be greater than 0"),
  propertyType: z.enum(["house", "apartment", "plot", "commercial"]),
  purpose: z.enum(["sale", "rent"]),
  status: z.enum(["available", "sold", "rented", "draft"]),
  bedrooms: num("Bedrooms").int("Use a whole number").min(0, "Cannot be negative").max(20, "Max 20"),
  area: num("Area").min(0, "Cannot be negative"),
  city: z.string().trim().min(2, "City is required"),
  areaLocation: z.string().trim().max(80),
  address: z.string().trim().max(200),
});

// Password rules shown live under the password box
export const passwordRules = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "One number", test: (v) => /[0-9]/.test(v) },
];