import express from "express";
import { registerUser, loginUser } from "../Controllers/userController.js";

const router = express.Router();

// User registration endpoint

router.post("/register", registerUser);

// User login endpoint

router.post("/login", loginUser);

export default router;