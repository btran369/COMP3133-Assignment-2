import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);

// Ensure username behaves like a primary key requirement
UserSchema.index({ username: 1 }, { unique: true });

UserSchema.pre("save", async function userPreSave(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function comparePassword(plain) {
  return bcrypt.compare(plain, this.password);
};

export const User = mongoose.model("User", UserSchema);