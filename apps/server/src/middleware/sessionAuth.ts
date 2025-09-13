import { Request, Response, NextFunction } from 'express';
import { createError } from '../utils/helpers';

export interface SessionAuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    businessId: string;
    role: string;
    name?: string;
  };
  businessId?: string;
}

// Session validation middleware
export function validateSession(
  req: SessionAuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  // Extract session token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError('Session token is required', 401, 'MISSING_SESSION_TOKEN');
  }

  const sessionToken = authHeader.replace('Bearer ', '');
  
  if (!sessionToken) {
    throw createError('Invalid session token format', 401, 'INVALID_SESSION_TOKEN');
  }

  // The session token will be validated by the client
  // For now, we'll extract user info from the request body or headers
  // In a real implementation, you'd validate the JWT token or session
  
  // Extract user info from custom headers (sent by client after NextAuth validation)
  const userId = req.headers['x-user-id'] as string;
  const userEmail = req.headers['x-user-email'] as string;
  const userBusinessId = req.headers['x-user-business-id'] as string;
  const userRole = req.headers['x-user-role'] as string;
  const userName = req.headers['x-user-name'] as string;

  if (!userId || !userBusinessId) {
    throw createError('Invalid session: missing user information', 401, 'INVALID_SESSION_DATA');
  }

  // Attach user info to request
  req.user = {
    id: userId,
    email: userEmail,
    businessId: userBusinessId,
    role: userRole,
    name: userName
  };
  
  req.businessId = userBusinessId;

  next();
}

// Optional: Validate specific roles
export function requireRole(allowedRoles: string[]) {
  return (req: SessionAuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw createError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
    }

    next();
  };
}

// Validate business access (ensure user belongs to the business)
export function validateBusinessAccess(
  req: SessionAuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const requestedBusinessId = req.params.businessId || req.body.businessId || req.query.businessId;
  
  if (requestedBusinessId && req.user?.businessId !== requestedBusinessId) {
    throw createError('Access denied to this business', 403, 'BUSINESS_ACCESS_DENIED');
  }

  next();
}
