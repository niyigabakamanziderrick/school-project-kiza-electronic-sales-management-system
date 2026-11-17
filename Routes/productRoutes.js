
import express from "express";

import { addProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from "../Controllers/productController.js";

import { verifyLogin } from "../Middleware/Auth.js";

const router = express.Router();

// Endpoint to add a product (logged-in users only)

router.post("/add-product", verifyLogin, addProduct);

// Endpoint to get all products

router.get("/all-products", getAllProducts);

// Endpoint to get a product by ID

router.get("/product-by-id/:id", getProductById);

// Endpoint to update a product (logged-in users only)

router.put("/update-product/:id", verifyLogin, updateProduct);

// Endpoint to delete a product (logged-in users only)

router.delete("/delete-product/:id", verifyLogin, deleteProduct);

export default router;
