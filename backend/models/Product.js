const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true }, // Example: "Herbs", "Oils"
  imageUrl: { type: String, required: true }, // Store product image link
});

module.exports = mongoose.model("Product", ProductSchema);
