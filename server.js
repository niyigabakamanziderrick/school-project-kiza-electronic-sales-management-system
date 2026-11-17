
import express from 'express';

import dotenv from 'dotenv';

import db from './Config/db.js';

import session from 'express-session'

import userRoutes from "./Routes/userRoutes.js";

import productRoutes from "./Routes/productRoutes.js";

import saleRoutes from "./Routes/saleRoutes.js";

// Load environment variables

dotenv.config();

// Create Express application

const app = express();

// Homepage Route

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome! Backend API is running successfully.'
    });
});

// Connect to MySQL database

try {
    const connection = await db.getConnection();

    console.log('MySQL database connected successfully!');

    connection.release();

} catch (error) {
    console.error('MySQL database connection failed:', error.message);

    process.exit(1);
}

// Middleware

app.use(express.json());


// Session configuration

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));


// Connect user routes

app.use("/api/users", userRoutes);


// Connect product routes

app.use("/api/products", productRoutes);

// Connect sale routes

app.use("/api/sales", saleRoutes);


// Server port

const PORT = process.env.PORT || 5000;

// Start server

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
