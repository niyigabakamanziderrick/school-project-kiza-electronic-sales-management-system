import bcrypt from "bcrypt";
import db from "../Config/db.js";


// Register user

export const registerUser = async (req, res) => {
    try {
        const { Username, Email, Password } = req.body;

        // Check required fields

        if (!Username || !Email || !Password) {
            return res.status(400).json({
                message: "Username, Email, and Password are required"
            });
        }

        // Check for duplicate username or email

        const [existingUser] = await db.execute(
            "SELECT * FROM users WHERE Username = ? OR Email = ?",
            [Username, Email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                message: "Username or Email already exists"
            });
        }

        // Hash password

        const hashedPassword = await bcrypt.hash(Password, 12);

        // Register user

        await db.execute(
            "INSERT INTO users (Username, Email, Password) VALUES (?, ?, ?)",
            [Username, Email, hashedPassword]
        );

        return res.status(201).json({
            message: "User registered successfully"
        });

    } catch (error) {
        console.error("Registration error:", error);

        // Handle duplicate username or email

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Username or Email already exists"
            });
        }

        return res.status(500).json({
            message: "Registration failed"
        });
    }
};





// Login user

export const loginUser = async (req, res) => {
    try {
        // Get login details
        
        const { Username, Password } = req.body;

        // Check required fields

        if (!Username || !Password) {
            return res.status(400).json({
                message: "Username and Password are required"
            });
        }

        // Find user by Username

        const [users] = await db.execute(
            "SELECT * FROM users WHERE Username = ?",
            [Username]
        );

        // Check if user exists

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid Username or Password"
            });
        }

        const user = users[0];

        // Compare entered password with hashed password

        const isPasswordValid = await bcrypt.compare(
            Password,
            user.Password
        );

        // Check password

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid Username or Password"
            });
        }

        // Login successful

        return res.status(200).json({
            message: "Login successful",
            user: {
                UserId: user.UserId,
                Username: user.Username,
                Email: user.Email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Something went wrong during login"
        });
    }
};
