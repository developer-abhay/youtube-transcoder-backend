import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface CustomRequest extends Request {
    user?: {
        id: string;
        email: string;
        username: string;
    };
}

export const authenticationMiddleware = (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        let token;
        // Get the token from the 'Authentication' cookie
        token = req.cookies['access-token'];

        // If cookies doesn't have the token, get it from the 'authorization' headers
        token = token ? token : req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        const secretKey = process.env.JWT_SECRET;

        if (!secretKey) {
            throw new Error('INVALID SECRET')
        }
        // Verify the token
        const decoded = jwt.verify(token, secretKey) as { id: string; email: string, username: string };

        // Attach user info to the request
        req.user = { id: decoded.id, email: decoded.email, username: decoded.username };

        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};
