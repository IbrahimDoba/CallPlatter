import { Router, type Request, type Response } from 'express';
import { sendWaitlistConfirmation } from '../services/resendService';

const router: Router = Router();

// POST /api/waitlist - Add user to waitlist and send confirmation email
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Send confirmation email using Resend
    const result = await sendWaitlistConfirmation({
      email
    });

    // Success - no logging needed in production

    res.json({
      success: true,
      message: 'Successfully added to waitlist',
      messageId: result.messageId
    });

  } catch (error) {
    console.error('Waitlist submission error:', error);
    
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.message.includes('RESEND_API_KEY')) {
        return res.status(500).json({
          success: false,
          error: 'Email service configuration error. Please contact support.'
        });
      }
      
      if (error.message.includes('email') || error.message.includes('resend')) {
        return res.status(503).json({
          success: false,
          error: 'Email service temporarily unavailable. Please try again later.'
        });
      }
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again later.'
    });
  }
});

export default router;
