const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  tableNumber: { type: String, required: true },
  items: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantityType: { type: String, enum: ["Full Plate", "Half Plate", "Custom"], required: true },
      quantity: { type: Number, required: true },
    }
  ],
  total: { type: Number, required: true },
  customerMessage: { type: String, default: "" },
  status: {
    type: String,
    enum: ["pending", "completed", "paid", "cancelled"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
