import express from "express";

import { addSale, getAllSales } from "../Controllers/saleController.js";


const router = express.Router();

// Add a new sale

router.post("/add-sale", addSale);

// Read all sales

router.get("/get-all-sales", getAllSales);

export default router;