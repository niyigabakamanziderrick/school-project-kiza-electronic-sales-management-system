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
            "SELECT UserId FROM users WHERE Username = ? OR Email = ?",
            [Username, Email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                message: "Username or Email already exists"
            });
        }

        // Hash password

        const hashedPassword = await bcrypt.hash(Password, 10);

        // Insert user into database

        await db.execute(
            "INSERT INTO users (Username, Email, Password) VALUES (?, ?, ?)",
            [Username, Email, hashedPassword]
        );

        // Registration successful

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
        // Get login credentials

        const { Username, Password } = req.body;

        // Check required fields

        if (!Username || !Password) {
            return res.status(400).json({
                message: "Username and Password are required"
            });
        }

        // Find user by Username

        const [users] = await db.execute(
            "SELECT UserId, Username, Email, Password FROM users WHERE Username = ?",
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

        // Create session and store user ID

        req.session.userId = user.UserId;

        // Save session
        
        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);

                return res.status(500).json({
                    message: "Failed to save login session"
                });
            }

            return res.status(200).json({
                message: "Login successful",
                user: {
                    UserId: user.UserId,
                    Username: user.Username,
                    Email: user.Email
                }
            });
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Something went wrong during login"
        });
    }
};







// Logout user

export const logoutUser = (req, res) => {
    
    // Destroy session

    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error:", err);

            return res.status(500).json({
                message: "Failed to log out"
            });
        }

        return res.status(200).json({
            message: "Logout successful"
        });
    });
};








// Reset password

export const resetPassword = async (req, res) => {
    try {
        const { NewPassword } = req.body;

        // Check required field

        if (!NewPassword) {
            return res.status(400).json({
                message: "NewPassword is required"
            });
        }

        // Check if user is logged in

        if (!req.session.userId) {
            return res.status(401).json({
                message: "Please log in to reset your password"
            });
        }

        // Hash new password

        const hashedPassword = await bcrypt.hash(NewPassword, 10);

        // Update password using session UserId
        
        await db.execute(
            "UPDATE users SET Password = ? WHERE UserId = ?",
            [hashedPassword, req.session.userId]
        );

        return res.status(200).json({
            message: "Password reset successful"
        });

    } catch (error) {
        console.error("Password reset error:", error);

        return res.status(500).json({
            message: "Failed to reset password"
        });
    }
};