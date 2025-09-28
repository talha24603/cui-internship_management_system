const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const PORT = 3000;

app.use(express.json());

// Simple handlers for local development
app.get('/api', (req, res) => {
  res.json({
    message: "Backend API is running locally",
    environment: "development",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/api/health",
      docs: "/api/docs",
      auth: {
        register: "/api/auth/register",
        login: "/api/auth/login",
        verifyEmail: "/api/auth/verify-email",
        refreshToken: "/api/auth/refresh-token",
        logout: "/api/auth/logout"
      }
    }
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    const userCount = await prisma.user.count();
    
    res.json({
      message: "Server is running",
      environment: "development",
      timestamp: new Date().toISOString(),
      status: "healthy",
      database: "connected",
      userCount: userCount
    });
  } catch (error) {
    res.status(500).json({
      message: "Health check failed",
      environment: "development",
      timestamp: new Date().toISOString(),
      status: "unhealthy",
      database: "disconnected",
      error: error.message
    });
  }
});

app.get('/api/docs', (req, res) => {
  res.send(`
    <html>
      <body style="font-family: Arial, sans-serif; padding: 50px;">
        <h1>CUI Bio-internship API Documentation</h1>
        <p>For full interactive documentation, please use the deployed version on Vercel.</p>
        <h2>Available Endpoints:</h2>
        <ul>
          <li>GET /api - API Information</li>
          <li>GET /api/health - Health Check</li>
          <li>POST /api/auth/register - Register User</li>
          <li>POST /api/auth/login - Login User</li>
          <li>POST /api/auth/verify-email - Verify Email</li>
          <li>POST /api/auth/refresh-token - Refresh Token</li>
          <li>POST /api/auth/logout - Logout User</li>
        </ul>
        <p><strong>Note:</strong> This is a simplified local version. For full functionality, deploy to Vercel.</p>
      </body>
    </html>
  `);
});

// Placeholder endpoints for auth
app.all('/api/auth/register', (req, res) => {
  res.status(501).json({
    message: "Authentication endpoints not available in local mode",
    note: "Please deploy to Vercel for full functionality"
  });
});

app.all('/api/auth/login', (req, res) => {
  res.status(501).json({
    message: "Authentication endpoints not available in local mode",
    note: "Please deploy to Vercel for full functionality"
  });
});

app.all('/api/auth/verify-email', (req, res) => {
  res.status(501).json({
    message: "Authentication endpoints not available in local mode",
    note: "Please deploy to Vercel for full functionality"
  });
});

app.all('/api/auth/refresh-token', (req, res) => {
  res.status(501).json({
    message: "Authentication endpoints not available in local mode",
    note: "Please deploy to Vercel for full functionality"
  });
});

app.all('/api/auth/logout', (req, res) => {
  res.status(501).json({
    message: "Authentication endpoints not available in local mode",
    note: "Please deploy to Vercel for full functionality"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Docs available at http://localhost:${PORT}/api/docs`);
  console.log(`Note: This is a simplified local version. Deploy to Vercel for full functionality.`);
});
