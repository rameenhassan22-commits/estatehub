import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    // select:false = the password is NOT returned by queries unless you ask for it
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["super_admin", "agency_admin", "agent", "customer"],
      required: true,
    },
    // Null only for super_admin and public customers
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      default: null,
      index: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash the password before saving (only when it was set or changed)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Used at login to compare the typed password with the stored hash
userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

export default mongoose.model("User", userSchema);