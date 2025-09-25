// Minimal test version to isolate the issue
export default async function handler(req: any, res: any) {
  try {
    console.log("Function started successfully");
    
    // Basic health check
    if (req.url === "/api/health" || req.url === "/") {
      return res.status(200).json({
        message: "Serverless function is working",
        timestamp: new Date().toISOString(),
        url: req.url,
        method: req.method
      });
    }
    
    // Test Prisma import
    try {
      const { PrismaClient } = await import("@prisma/client");
      console.log("Prisma import successful");
      
      const prisma = new PrismaClient();
      console.log("Prisma client created");
      
      // Test database connection
      await prisma.$connect();
      console.log("Database connection successful");
      
      await prisma.$disconnect();
      console.log("Database disconnected");
      
      return res.status(200).json({
        message: "All systems working",
        prisma: "OK",
        database: "OK"
      });
      
    } catch (prismaError) {
      console.error("Prisma error:", prismaError);
      return res.status(500).json({
        message: "Prisma error",
        error: prismaError.message
      });
    }
    
  } catch (error) {
    console.error("Function error:", error);
    return res.status(500).json({
      message: "Function crashed",
      error: error.message,
      stack: error.stack
    });
  }
}
