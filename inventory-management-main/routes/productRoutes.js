const express = require("express");
const { createProduct, getProducts, getProductById, updateProduct, deleteProduct, restockProduct, sellProduct } = require("../controllers/productController");
const router = express.Router();
router.route("/").post(createProduct).get(getProducts);
router.patch("/:id/restock", restockProduct);
router.patch("/:id/sale", sellProduct);
router.route("/:id").get(getProductById).put(updateProduct).delete(deleteProduct);
module.exports = router;