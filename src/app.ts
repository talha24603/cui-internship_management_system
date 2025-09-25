import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";

dotenv.config();

// Check for required environment variables
// const requiredEnvVars = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'JWT_EMAIL_SECRET'];
// const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

// if (missingEnvVars.length > 0) {
//     console.error('Missing required environment variables:', missingEnvVars);
//     console.error('Please set these environment variables in your Vercel dashboard');
// }

const app = express();

app.use(express.json());
app.use(cookieParser());

// Health check endpoint
// app.get("/api/health", (req, res) => {
//     res.status(200).json({ 
//         message: "Server is running",
//         environment: process.env.NODE_ENV,
//         timestamp: new Date().toISOString(),
//         missingEnvVars: missingEnvVars
//     });
// });


app.use("/api/auth", authRoutes);

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
    console.error("Error:", err);
    res.status(500).json({ message: "Something went wrong!" });
});

// const port = process.env.PORT || 8000;

// Only start server if not in Vercel environment
// if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
//     app.listen(port, () => {
//         console.log(`Server running on port ${port}`);
//     });
// }

export default app;