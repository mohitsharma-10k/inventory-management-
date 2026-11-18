const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");
const getLowStockReport = asyncHandler(async (req, res) => {
  const threshold = Number(req.query.threshold ?? process.env.LOW_STOCK_THRESHOLD ?? 5);
  if (!Number.isFinite(threshold) || threshold < 0) {
    res.status(400);
    throw new Error("Threshold must be a non-negative number");
  }
  const products = await Product.find({ quantity: { $lte: threshold } }).sort({ quantity: 1, name: 1 });
  res.json({ success: true, threshold, count: products.length, data: products });
});
const getCategorySummary = asyncHandler(async (req, res) => {
  const summary = await Product.aggregate([
    { $group: { _id: "$category", productCount: { $sum: 1 }, totalUnits: { $sum: "$quantity" }, inventoryValue: { $sum: { $multiply: ["$price", "$quantity"] } }, averagePrice: { $avg: "$price" } } },
    { $project: { _id: 0, category: "$_id", productCount: 1, totalUnits: 1, inventoryValue: { $round: ["$inventoryValue", 2] }, averagePrice: { $round: ["$averagePrice", 2] } } },
    { $sort: { category: 1 } }
  ]);
  res.json({ success: true, count: summary.length, data: summary });
});
module.exports = { getLowStockReport, getCategorySummary };