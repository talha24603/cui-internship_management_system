import { Handler } from "@netlify/functions";
import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "../../src/routes/authRoutes";

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

app.use("/api/auth", authRoutes);

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
    console.error("Error:", err);
    res.status(500).json({ message: "Something went wrong!" });
});

const handler: Handler = async (event, context) => {
  // Convert Netlify event to Express request
  const expressRequest = {
    method: event.httpMethod,
    url: event.path,
    headers: event.headers,
    body: event.body,
    query: event.queryStringParameters || {},
  };

  return new Promise((resolve) => {
    const expressResponse = {
      status: (code: number) => ({
        json: (data: any) => {
          resolve({
            statusCode: code,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
              "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            },
            body: JSON.stringify(data),
          });
        },
        send: (data: any) => {
          resolve({
            statusCode: code,
            headers: {
              "Content-Type": "text/plain",
              "Access-Control-Allow-Origin": "*",
            },
            body: data,
          });
        },
      }),
      json: (data: any) => {
        resolve({
          statusCode: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify(data),
        });
      },
      send: (data: any) => {
        resolve({
          statusCode: 200,
          headers: {
            "Content-Type": "text/plain",
            "Access-Control-Allow-Origin": "*",
          },
          body: data,
        });
      },
    };

    app(expressRequest as any, expressResponse as any);
  });
};

export { handler };
