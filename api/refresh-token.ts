import { verifyRefreshToken, signAccessToken } from "../src/utils/authhelper";

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
        const { refreshToken } = req.cookies;
        
        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token not provided" });
        }

        const payload = verifyRefreshToken(refreshToken);
        const newAccessToken = signAccessToken({ sub: (payload as any).sub });
        
        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        console.error("Refresh token error:", error);
        res.status(401).json({ message: "Invalid refresh token" });
    }
}
