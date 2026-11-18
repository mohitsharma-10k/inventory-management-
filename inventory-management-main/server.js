require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const reportRoutes = require("./routes/reportRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const app = express();
app.use(express.json());
app.get("/", (req, res) => {
  res.json({ message: "Inventory Management API is running", endpoints: ["/api/products", "/api/reports/low-stock", "/api/reports/category-summary"] });
});
app.use("/api/products", productRoutes);
app.use("/api/reports", reportRoutes);
app.use(notFound);
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};
startServer();