import { PrismaClient } from "@prisma/client";

// Prisma client with connection pooling for serverless
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function handler(req: any, res: any) {
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
        // Test database connection
        await prisma.$connect();
        const userCount = await prisma.user.count();
        
        res.status(200).json({
            message: "Server is running",
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
            status: "healthy",
            database: "connected",
            userCount: userCount
        });
    } catch (error) {
        console.error("Error in health handler:", error);
        res.status(500).json({
            message: "Health check failed",
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
            status: "unhealthy",
            database: "disconnected",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}
