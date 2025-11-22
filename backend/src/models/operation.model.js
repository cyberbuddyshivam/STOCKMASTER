import mongoose, { Schema } from "mongoose";

const operationLineSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  demandQuantity: { type: Number, required: true }, // Ordered Qty
  doneQuantity: { type: Number, default: 0 }, // Actual Processed Qty
});

const operationSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true }, // e.g., WH/IN/001
    type: {
      type: String,
      enum: ["RECEIPT", "DELIVERY", "INTERNAL_TRANSFER", "ADJUSTMENT"],
      required: true,
    },
    partner: { type: mongoose.Schema.Types.ObjectId, ref: "Contact" }, // Vendor or Customer

    // Movement Logic
    sourceLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    destinationLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },

    scheduledDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["DRAFT", "READY", "DONE", "CANCELLED"],
      default: "DRAFT",
    },
    lines: [operationLineSchema], // The items involved
  },
  { timestamps: true }
);

module.exports = mongoose.model("Operation", operationSchema);
