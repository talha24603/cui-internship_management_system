import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import serverless from "serverless-http";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

// Health check endpoint
app.get("/api/health", async (req, res) => {
    try {
        res.status(200).json({
            message: "Server is running",
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
            status: "healthy"
        });
    } catch (error) {
        console.error("Health check error:", error);
        res.status(500).json({
            message: "Health check failed",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

// Test endpoint
app.get("/api", (req, res) => {
    res.json({
        message: "Hello from Vercel!",
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
    console.error("Error:", err);
    res.status(500).json({ message: "Something went wrong!" });
});

export default serverless(app);
