import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

// Prisma client with connection pooling for serverless
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const hashPassword = async (plain: string) => {
    return await  bcrypt.hash(plain, 12);
}

export const comparePassword = async (plain: string, hash: string) => {
    return await bcrypt.compare(plain, hash);
}

export const signAccessToken =  (payload: object) => {
    if (!process.env.JWT_ACCESS_SECRET) {
        throw new Error('JWT_ACCESS_SECRET environment variable is not set');
    }
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, { expiresIn: "15m" });
}

export const signRefreshToken = (payload: object) => {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET environment variable is not set');
    }
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, { expiresIn: "7d" });
}

export const verifyAccessToken = (token: string): JwtPayload => {
    if (!process.env.JWT_ACCESS_SECRET) {
        throw new Error('JWT_ACCESS_SECRET environment variable is not set');
    }
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as JwtPayload;
}
    
export const verifyRefreshToken = (token: string): JwtPayload => {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET environment variable is not set');
    }
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as JwtPayload;
}
export const signEmailToken = (userId: string) => {
    if (!process.env.JWT_EMAIL_SECRET) {
        throw new Error('JWT_EMAIL_SECRET environment variable is not set');
    }
    return jwt.sign({sub:userId}, process.env.JWT_EMAIL_SECRET as string, { expiresIn: "1h" });
}

export const verifyEmailToken = (token: string) => {
    if (!process.env.JWT_EMAIL_SECRET) {
        throw new Error('JWT_EMAIL_SECRET environment variable is not set');
    }
    return jwt.verify(token, process.env.JWT_EMAIL_SECRET as string);
}
export const storeRefreshToken = (userId: string, token: string) => {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return prisma.refreshToken.create({
        data: { userId, token, expiresAt }
    });
}
export const getRefreshToken = (userId: string) => {
    return prisma.refreshToken.findFirst({
        where: { userId, revoked: false },
        orderBy: { createdAt: 'desc' }
    });
}
export const revokeRefreshToken = (token: string) => {
    return prisma.refreshToken.update({
        where: { token },
        data: { revoked: true }
    });
}