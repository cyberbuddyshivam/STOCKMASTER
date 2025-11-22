import mongoose from "mongoose";

const stockLedgerSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true }, // Positive for add, negative for remove (conceptually)

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

  operationReference: { type: String, required: true }, // Links back to WH/IN/001
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("StockLedger", stockLedgerSchema);
