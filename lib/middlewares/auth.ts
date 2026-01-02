import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends NextRequest {
  userId?: string;
  userEmail?: string;
}

export const authenticateToken = (request: NextRequest): { userId: string; userEmail: string } | null => {
  const authHeader = request.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    return { userId: decoded.userId, userEmail: decoded.email };
  } catch (error) {
    return null;
  }
};

export const extractUserId = (request: NextRequest): string | null => {
  const auth = authenticateToken(request);
  return auth ? auth.userId : null;
};