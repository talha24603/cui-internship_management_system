import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import serverless from "serverless-http";

// Import controllers directly to avoid circular dependencies
import { register, login, verifyEmail, verifyEmailGet, refreshToken, logout } from "../src/controllers/authController";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

// Health check endpoint
app.get("/api/health", async (req, res) => {
    try {
        // Test database connection
        const { PrismaClient } = await import("@prisma/client");
        const prisma = new PrismaClient();
        await prisma.$connect();
        
        res.status(200).json({ 
            message: "Server is running",
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
            database: "connected"
        });
    } catch (error) {
        console.error("Health check error:", error);
        res.status(500).json({ 
            message: "Server is running but database connection failed",
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
            database: "disconnected",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

// Auth routes
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.post("/api/auth/verify-email", verifyEmail);
app.get("/api/auth/verify-email", verifyEmailGet);
app.post("/api/auth/refresh-token", refreshToken);
app.post("/api/auth/logout", logout);

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
    console.error("Error:", err);
    res.status(500).json({ message: "Something went wrong!" });
});

export default serverless(app);
