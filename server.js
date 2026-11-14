
import express from 'express';
import dotenv from 'dotenv';
import db from './Config/db.js';

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

// Server port

const PORT = process.env.PORT || 5000;

// Start server

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
