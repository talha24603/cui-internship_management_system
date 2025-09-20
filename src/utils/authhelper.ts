import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../../prisma/client";

export const hashPassword = async (plain: string) => {
    return await  bcrypt.hash(plain, 12);
}

export const comparePassword = async (plain: string, hash: string) => {
    return await bcrypt.compare(plain, hash);
}

export const signAccessToken =  (payload: object) => {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, { expiresIn: "15m" });
}

export const signRefreshToken = (payload: object) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, { expiresIn: "7d" });
}

export const verifyAccessToken = (token: string): JwtPayload => {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as JwtPayload;
}
    
export const verifyRefreshToken = (token: string): JwtPayload => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as JwtPayload;
}
export const signEmailToken = (userId: string) => {
    return jwt.sign({sub:userId}, process.env.JWT_EMAIL_SECRET as string, { expiresIn: "1h" });
}

export const verifyEmailToken = (token: string) => {
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