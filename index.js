const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        res.status(200).json({
            message: "Server is running",
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
            status: "healthy"
        });
    } catch (error) {
        res.status(500).json({
            message: "Health check failed",
            error: error.message
        });
    }
});

// Main API endpoint
app.get('/api', (req, res) => {
    res.json({
        message: "Backend API is running",
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        endpoints: {
            health: "/api/health",
            register: "/api/register",
            login: "/api/login"
        }
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        message: "Test endpoint working!",
        timestamp: new Date().toISOString()
    });
});

// Register endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        // For now, just return success without database operations
        res.status(201).json({
            message: "User registration endpoint working",
            user: { name, email }
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        
        // For now, just return success without database operations
        res.status(200).json({
            message: "Login endpoint working",
            user: { email }
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        message: "Not found",
        availableEndpoints: ["/api", "/api/health", "/api/register", "/api/login", "/api/test"]
    });
});

module.exports = app;
