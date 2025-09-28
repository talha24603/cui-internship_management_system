// Simple entry point for Vercel
module.exports = function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.url === '/' || req.url === '/api' || req.url === '/api/') {
      res.status(200).json({
        message: "Backend API is running",
        environment: process.env.NODE_ENV,
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
    } else {
      res.status(404).json({
        message: "Not found",
        availableEndpoints: ["/", "/health", "/docs", "/auth/register", "/auth/login", "/auth/verify-email", "/auth/refresh-token", "/auth/logout"]
      });
    }
  } catch (error) {
    console.error("Error in handler:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
};
