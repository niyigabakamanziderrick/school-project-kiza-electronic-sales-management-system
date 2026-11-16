import express from "express";

import { registerUser, loginUser, logoutUser, resetPassword } from "../Controllers/userController.js";

const router = express.Router();

// User registration endpoint

router.post("/register", registerUser);


// User login endpoint

router.post("/login", loginUser);


// User logout endpoint

router.post("/logout", logoutUser);


// User password reset endpoint

router.put("/reset-password", resetPassword);


export default router;