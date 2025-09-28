export default function handler(req: any, res: any) {
    res.status(200).json({
        message: "Test endpoint working!",
        timestamp: new Date().toISOString()
    });
}
