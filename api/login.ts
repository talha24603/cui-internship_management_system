import { PrismaClient } from "@prisma/client";
import { comparePassword, signAccessToken, signRefreshToken, storeRefreshToken } from "../src/utils/authhelper";

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

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isPasswordCorrect = await comparePassword(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const accessToken = signAccessToken({ sub: user.id, name: user.name, email: user.email });
        const refreshToken = signRefreshToken({ sub: user.id });
        
        // Store refresh token in database
        await storeRefreshToken(user.id, refreshToken);
        
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true, 
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production", 
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        res.status(200).json({
            message: "Login successful", 
            user: { id: user.id, name: user.name, email: user.email },
            accessToken
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
