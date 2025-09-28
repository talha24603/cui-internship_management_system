import { PrismaClient } from "@prisma/client";
import { comparePassword, hashPassword, signAccessToken, signRefreshToken, storeRefreshToken, signEmailToken } from "../src/utils/authhelper";
import { sendVerificationEmail } from "../src/utils/mailer";

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
        const { regNo, role, name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const userData = { 
            regNo: regNo || null, 
            role: role || 'user', 
            name, 
            email, 
            password: hashedPassword
        };
        const user = await prisma.user.create({ data: userData });

        console.log("User created successfully:", { id: user.id, email: user.email });

        // Send verification email
        try {
            const emailToken = signEmailToken(user.id);
            await sendVerificationEmail(user.email, emailToken);
            
            res.status(201).json({
                message: "User created successfully. Please check your email for verification link.", 
                user: { id: user.id, name: user.name, email: user.email }
            });
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
            res.status(201).json({
                message: "User created successfully. Email verification could not be sent.", 
                user: { id: user.id, name: user.name, email: user.email }
            });
        }
    } catch (error) {
        console.error("Register error:", error);
        
        // Handle specific Prisma errors
        if (error && typeof error === 'object' && 'code' in error) {
            const prismaError = error as any;
            if (prismaError.code === 'P2002') {
                return res.status(400).json({ message: "User with this email already exists" });
            }
        }
        
        res.status(500).json({ message: "Internal server error" });
    }
}
