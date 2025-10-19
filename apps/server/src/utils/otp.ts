import crypto from 'crypto';

/**
 * Generate a 6-digit OTP for email verification
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate a secure OTP using crypto.randomInt (more secure)
 */
export function generateSecureOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Check if OTP is valid format (6 digits)
 */
export function isValidOTPFormat(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

/**
 * Check if OTP has expired
 */
export function isOTPExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Generate OTP expiration time (5 minutes from now)
 */
export function getOTPExpirationTime(): Date {
  const now = new Date();
  return new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
}

/**
 * Generate password reset OTP expiration time (15 minutes from now)
 */
export function getPasswordResetOTPExpirationTime(): Date {
  const now = new Date();
  return new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes
}

/**
 * Clean up expired OTPs from database
 */
export async function cleanupExpiredOTPs(db: any) {
  try {
    const result = await db.emailVerificationToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
    
    console.log(`Cleaned up ${result.count} expired OTPs`);
    return result.count;
  } catch (error) {
    console.error('Error cleaning up expired OTPs:', error);
    return 0;
  }
}

/**
 * Rate limiting: Check if user has exceeded OTP request limit
 */
export async function checkOTPRateLimit(db: any, email: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const recentRequests = await db.emailVerificationToken.count({
    where: {
      email,
      createdAt: {
        gte: oneHourAgo
      }
    }
  });
  
  // Allow max 3 OTP requests per hour
  return recentRequests < 3;
}

/**
 * Rate limiting: Check if user has exceeded verification attempts
 */
export async function checkVerificationRateLimit(db: any, email: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const recentAttempts = await db.emailVerificationToken.count({
    where: {
      email,
      createdAt: {
        gte: oneHourAgo
      },
      used: true
    }
  });
  
  // Allow max 5 verification attempts per hour
  return recentAttempts < 5;
}

/**
 * Rate limiting: Check if user has exceeded password reset OTP requests
 */
export async function checkPasswordResetOTPRateLimit(db: any, email: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const recentRequests = await db.passwordResetToken.count({
    where: {
      email,
      createdAt: {
        gte: oneHourAgo
      }
    }
  });
  
  // Allow max 3 password reset OTP requests per hour
  return recentRequests < 3;
}

/**
 * Rate limiting: Check if user has exceeded password reset attempts
 */
export async function checkPasswordResetAttemptRateLimit(db: any, email: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const recentAttempts = await db.passwordResetToken.count({
    where: {
      email,
      createdAt: {
        gte: oneHourAgo
      },
      used: true
    }
  });
  
  // Allow max 3 password reset attempts per hour
  return recentAttempts < 3;
}
