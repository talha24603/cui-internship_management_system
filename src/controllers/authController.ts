import { PrismaClient } from "@prisma/client";
import { comparePassword, hashPassword, signAccessToken, signRefreshToken, storeRefreshToken, verifyRefreshToken, verifyEmailToken, revokeRefreshToken, signEmailToken } from "../utils/authhelper";
import { sendVerificationEmail } from "../utils/mailer";
import { Request, Response } from "express";

// Prisma client with connection pooling for serverless
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;



export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        // Validate input FIRST
        if(!name || !email || !password){
            return res.status(400).json({message: "All fields are required"});
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({message: "Invalid email format"});
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({message: "Password must be at least 6 characters long"});
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({message: "User with this email already exists"});
        }

        // Hash password AFTER validation
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await prisma.user.create({
            data: {name, email, password: hashedPassword}
        });

        console.log("User created successfully:", { id: user.id, email: user.email });

        // Send verification email
        try {
            const emailToken = signEmailToken(user.id);
            await sendVerificationEmail(user.email, emailToken);
            
            res.status(201).json({
                message: "User created successfully. Please check your email for verification link.", 
                user: {id: user.id, name: user.name, email: user.email}
            });
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
            // Still return success but mention email issue
            res.status(201).json({
                message: "User created successfully. Email verification could not be sent.", 
                user: {id: user.id, name: user.name, email: user.email}
            });
        }
    }
    catch(error){
        console.error("Register error:", error);
        
        // Handle specific Prisma errors
        if (error && typeof error === 'object' && 'code' in error) {
            const prismaError = error as any;
            if (prismaError.code === 'P2002') {
                return res.status(400).json({message: "User with this email already exists"});
            }
        }
        
        return res.status(500).json({message: "Internal server error"});
    }
}

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    if(!email || !password){
        return res.status(400).json({message: "Email and password are required"});
    }

    try {
        const user = await prisma.user.findUnique({where: {email}});
        if(!user){
            return res.status(400).json({message: "User not found"});
        }
        const isPasswordCorrect = await comparePassword(password, user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid password"});
        }
        const accessToken = signAccessToken({sub: user.id, name: user.name, email: user.email});
        const refreshToken = signRefreshToken({sub: user.id});
        
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
            user: {id: user.id, name: user.name, email: user.email},
            accessToken
        });

    } catch(error) {
        return res.status(500).json({message: "Internal server error"});
    }
}

export const verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ message: "Token is required" });
    }

    try {
        const payload = verifyEmailToken(token);
        await prisma.user.update({
            where: { id: (payload as any).sub },
            data: { verified: true }
        });
        
        res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        return res.status(400).json({ message: "Invalid or expired token" });
    }
}

export const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token not provided" });
    }

    try {
        const payload = verifyRefreshToken(refreshToken);
        const newAccessToken = signAccessToken({ sub: (payload as any).sub });
        
        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        return res.status(401).json({ message: "Invalid refresh token" });
    }
}

export const verifyEmailGet = async (req: Request, res: Response) => {
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

    try {
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
    } catch (error) {
        res.status(400).send(`
            <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h2>❌ Verification Failed</h2>
                    <p>Invalid or expired token. Please request a new verification email.</p>
                    <a href="${process.env.APP_URL || 'https://ef3198d5ea9b416c9765f57ee606d2ab.serveo.net'}" style="color: #007bff;">Go to App</a>
                </body>
            </html>
        `);
    }
}

export const logout = async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;
    
    if (refreshToken) {
        try {
            await revokeRefreshToken(refreshToken);
        } catch (error) {
            // Continue with logout even if token revocation fails
        }
    }
    
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
}