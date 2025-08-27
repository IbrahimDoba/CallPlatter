import { Request, Response, NextFunction } from 'express';
import { createError } from '../utils/helpers';

export interface AuthenticatedRequest extends Request {
  businessId?: string;
}

export function validateApiKey(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  // TODO: Commented out for development - will implement proper API key validation later
  /*
  const apiKey = req.headers['x-api-key'] || req.headers.authorization?.replace('Bearer ', '');
  
  if (!apiKey) {
    throw createError('API key is required', 401, 'MISSING_API_KEY');
  }

  // TODO: Implement proper API key validation logic
  // For now, we'll accept any non-empty string
  if (typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    throw createError('Invalid API key', 401, 'INVALID_API_KEY');
  }
  */

  // TODO: Decode API key to get business ID
  // For now, we'll extract it from the request body or query params
  const businessId = req.body.businessId || req.query.businessId;
  
  if (businessId) {
    req.businessId = businessId as string;
  }

  next();
}

export function validateBusinessId(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const businessId = req.businessId || req.params.businessId || req.body.businessId;
  
  if (!businessId) {
    throw createError('Business ID is required', 400, 'MISSING_BUSINESS_ID');
  }

  req.businessId = businessId as string;
  next();
}
