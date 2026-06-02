import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true
    },
    designation: { type: String, required: true, trim: true },
    salary: { type: Number, required: true, min: 1000 },
    date_of_joining: { type: Date, required: true },
    department: { type: String, required: true, trim: true },
    employee_photo: { type: String, default: "" } // Cloudinary URL
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);

export const Employee = mongoose.model("Employee", EmployeeSchema);