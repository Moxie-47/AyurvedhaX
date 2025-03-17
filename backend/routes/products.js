const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// ✅ Get All Products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Get Product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Add a New Product (Admin Only)
router.post("/", async (req, res) => {
  try {
    const { name, description, price, category, imageUrl } = req.body;
    const newProduct = new Product({ name, description, price, category, imageUrl });
    await newProduct.save();
    res.json(newProduct);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
