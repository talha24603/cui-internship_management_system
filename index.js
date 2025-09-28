// Serverless function handler for Vercel
module.exports = (req, res) => {
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
        const { method, url } = req;
        
        // Route handling
        if (url === '/api/health') {
            res.status(200).json({
                message: "Server is running",
                environment: process.env.NODE_ENV,
                timestamp: new Date().toISOString(),
                status: "healthy"
            });
        } else if (url === '/api' || url === '/api/') {
            res.status(200).json({
                message: "Backend API is running",
                environment: process.env.NODE_ENV,
                timestamp: new Date().toISOString(),
                endpoints: {
                    health: "/api/health",
                    register: "/api/register",
                    login: "/api/login"
                }
            });
        } else if (url === '/api/register' && method === 'POST') {
            // Parse body for POST requests
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    const { name, email, password } = data;
                    
                    if (!name || !email || !password) {
                        res.status(400).json({ message: "All fields are required" });
                        return;
                    }
                    
                    res.status(201).json({
                        message: "User registration endpoint working",
                        user: { name, email }
                    });
                } catch (parseError) {
                    res.status(400).json({ message: "Invalid JSON" });
                }
            });
        } else if (url === '/api/login' && method === 'POST') {
            // Parse body for POST requests
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    const { email, password } = data;
                    
                    if (!email || !password) {
                        res.status(400).json({ message: "Email and password are required" });
                        return;
                    }
                    
                    res.status(200).json({
                        message: "Login endpoint working",
                        user: { email }
                    });
                } catch (parseError) {
                    res.status(400).json({ message: "Invalid JSON" });
                }
            });
        } else {
            res.status(404).json({
                message: "Not found",
                availableEndpoints: ["/api", "/api/health", "/api/register", "/api/login"]
            });
        }
    } catch (error) {
        console.error("Error in handler:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};
