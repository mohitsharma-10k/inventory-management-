const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
    minlength: [2, "Product name must contain at least 2 characters"],
    maxlength: [100, "Product name cannot exceed 100 characters"]
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"],
    default: ""
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    trim: true,
    maxlength: [60, "Category cannot exceed 60 characters"]
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"]
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [0, "Quantity cannot be negative"],
    validate: {
      validator: Number.isInteger,
      message: "Quantity must be a whole number"
    }
  },
  sku: {
    type: String,
    required: [true, "SKU is required"],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [3, "SKU must contain at least 3 characters"]
  },
  supplier: {
    type: String,
    trim: true,
    default: "Not specified"
  }
}, { timestamps: true });
productSchema.index({ name: "text", category: "text", description: "text" });
module.exports = mongoose.model("Product", productSchema);