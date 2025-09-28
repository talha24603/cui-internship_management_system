// Minimal test function to debug Vercel deployment
export default function handler(req: any, res: any) {
    console.log("Function invoked:", req.method, req.url);
    
    try {
        res.status(200).json({
            message: "Hello from Vercel!",
            method: req.method,
            url: req.url,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV
        });
    } catch (error) {
        console.error("Error in handler:", error);
        res.status(500).json({
            message: "Error occurred",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}
