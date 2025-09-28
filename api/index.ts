// Simple Vercel serverless function without serverless-http
export default function handler(req: any, res: any) {
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

    console.log("Function invoked:", req.method, req.url);

    try {
        // Route handling
        if (req.url === '/health' || req.url === '/api/health') {
            res.status(200).json({
                message: "Server is running",
                environment: process.env.NODE_ENV,
                timestamp: new Date().toISOString(),
                status: "healthy"
            });
        } else if (req.url === '/' || req.url === '/api' || req.url === '/api/') {
            res.status(200).json({
                message: "Hello from Vercel!",
                method: req.method,
                url: req.url,
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV
            });
        } else {
            res.status(404).json({
                message: "Not found",
                url: req.url,
                availableEndpoints: ["/", "/health"]
            });
        }
    } catch (error) {
        console.error("Error in handler:", error);
        res.status(500).json({
            message: "Error occurred",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}
