import { PrismaClient } from "@prisma/client";
import { verifyEmailToken } from "../../src/utils/authhelper";

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
        if (req.method === 'POST') {
            // POST /api/auth/verify-email
            const { token } = req.body;
            
            if (!token) {
                return res.status(400).json({ message: "Token is required" });
            }

            const payload = verifyEmailToken(token);
            await prisma.user.update({
                where: { id: (payload as any).sub },
                data: { verified: true }
            });
            
            res.status(200).json({ message: "Email verified successfully" });
        } else if (req.method === 'GET') {
            // GET /api/auth/verify-email?token=...
            const { token } = req.query;
            
            if (!token) {
                return res.status(400).send(`
                    <html>
                        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                            <h2>❌ Verification Failed</h2>
                            <p>No token provided.</p>
                            <a href="${process.env.APP_URL || 'https://ef3198d5ea9b416c9765f57ee606d2ab.serveo.net'}" style="color: #007bff;">Go to App</a>
                        </body>
                    </html>
                `);
            }

            const payload = verifyEmailToken(token as string);
            await prisma.user.update({
                where: { id: (payload as any).sub },
                data: { verified: true }
            });
            
            res.send(`
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h2>✅ Email Verified Successfully!</h2>
                        <p>Your email has been verified. You can now log in to your account.</p>
                        <a href="${process.env.APP_URL || 'https://ef3198d5ea9b416c9765f57ee606d2ab.serveo.net'}/login" style="color: #007bff;">Go to Login</a>
                    </body>
                </html>
            `);
        } else {
            res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (error) {
        console.error("Verify email error:", error);
        if (req.method === 'GET') {
            res.status(400).send(`
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h2>❌ Verification Failed</h2>
                        <p>Invalid or expired token. Please request a new verification email.</p>
                        <a href="${process.env.APP_URL || 'https://ef3198d5ea9b416c9765f57ee606d2ab.serveo.net'}" style="color: #007bff;">Go to App</a>
                    </body>
                </html>
            `);
        } else {
            res.status(400).json({ message: "Invalid or expired token" });
        }
    }
}
