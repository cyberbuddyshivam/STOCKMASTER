import mongoose, { Schema } from "mongoose";

const contactSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["VENDOR", "CUSTOMER"], required: true },
    email: String,
    phone: String,
    address: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
