const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});
const getProducts = asyncHandler(async (req, res) => {
  const { category, search, minPrice, maxPrice, sort = "createdAt", order = "desc", page = 1, limit = 10 } = req.query;
  const filter = {};
  if (category) filter.category = new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
  if (search) filter.$text = { $search: search };
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
  }
  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const allowedSortFields = ["name", "price", "quantity", "category", "createdAt"];
  const sortField = allowedSortFields.includes(sort) ? sort : "createdAt";
  const sortOrder = order.toLowerCase() === "asc" ? 1 : -1;
  const [products, total] = await Promise.all([
    Product.find(filter).sort({ [sortField]: sortOrder }).skip((pageNumber - 1) * pageSize).limit(pageSize),
    Product.countDocuments(filter)
  ]);
  res.json({ success: true, count: products.length, total, page: pageNumber, pages: Math.ceil(total / pageSize), data: products });
});
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json({ success: true, data: product });
});
const updateProduct = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "description", "category", "price", "quantity", "sku", "supplier"];
  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) updates[key] = req.body[key];
  });
  const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json({ success: true, data: product });
});
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json({ success: true, message: "Product deleted successfully", data: product });
});
const restockProduct = asyncHandler(async (req, res) => {
  const amount = Number(req.body.quantity);
  if (!Number.isInteger(amount) || amount <= 0) {
    res.status(400);
    throw new Error("Restock quantity must be a positive whole number");
  }
  const product = await Product.findByIdAndUpdate(req.params.id, { $inc: { quantity: amount } }, { new: true, runValidators: true });
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json({ success: true, message: "Stock increased successfully", data: product });
});
const sellProduct = asyncHandler(async (req, res) => {
  const amount = Number(req.body.quantity);
  if (!Number.isInteger(amount) || amount <= 0) {
    res.status(400);
    throw new Error("Sale quantity must be a positive whole number");
  }
  const product = await Product.findOneAndUpdate({ _id: req.params.id, quantity: { $gte: amount } }, { $inc: { quantity: -amount } }, { new: true, runValidators: true });
  if (!product) {
    const exists = await Product.exists({ _id: req.params.id });
    if (!exists) {
      res.status(404);
      throw new Error("Product not found");
    }
    res.status(400);
    throw new Error("Insufficient stock for this sale");
  }
  res.json({ success: true, message: "Sale recorded and stock decreased successfully", data: product });
});
module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct, restockProduct, sellProduct };