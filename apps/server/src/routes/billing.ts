import type { Request, Response } from 'express';
import { Router } from 'express';
import { BillingService } from '../services/billingService';
import { db } from '@repo/db';

const router: Router = Router();
const billingService = new BillingService();

// Middleware to get businessId from headers (for now)
const getBusinessId = (req: Request): string | null => {
  return req.headers['x-business-id'] as string || null;
};

// Get current usage for authenticated business
router.get('/usage', async (req: Request, res: Response) => {
  try {
    const businessId = getBusinessId(req);
    
    if (!businessId) {
      return res.status(401).json({ error: 'Business ID required' });
    }

    const usage = await billingService.getCurrentUsage(businessId);
    
    res.json({
      success: true,
      data: usage
    });
  } catch (error) {
    console.error('Error getting usage:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get usage data' 
    });
  }
});

// Get usage limits status
router.get('/limits', async (req: Request, res: Response) => {
  try {
    const businessId = getBusinessId(req);
    
    if (!businessId) {
      return res.status(401).json({ error: 'Business ID required' });
    }

    const limits = await billingService.checkUsageLimits(businessId);
    
    res.json({
      success: true,
      data: limits
    });
  } catch (error) {
    console.error('Error checking limits:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check usage limits' 
    });
  }
});

// Get billing history
router.get('/history', async (req: Request, res: Response) => {
  try {
    const businessId = getBusinessId(req);
    
    if (!businessId) {
      return res.status(401).json({ error: 'Business ID required' });
    }

    const limit = Number.parseInt(req.query.limit as string) || 10;
    const history = await billingService.getBillingHistory(businessId, limit);
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error getting billing history:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get billing history' 
    });
  }
});

// Create subscription for business
router.post('/subscription', async (req: Request, res: Response) => {
  try {
    const businessId = getBusinessId(req);
    
    if (!businessId) {
      return res.status(401).json({ error: 'Business ID required' });
    }

    const { planType } = req.body;
    
    if (!planType || !['FREE', 'STARTER', 'BUSINESS', 'ENTERPRISE'].includes(planType)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid plan type' 
      });
    }

    // Check if subscription already exists
    const existingSubscription = await db.subscription.findUnique({
      where: { businessId: businessId }
    });

    if (existingSubscription) {
      return res.status(400).json({ 
        success: false, 
        error: 'Subscription already exists' 
      });
    }

    const subscription = await billingService.createSubscription(
      businessId,
      planType
    );
    
    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create subscription' 
    });
  }
});

// Generate monthly bill
router.post('/generate-bill', async (req: Request, res: Response) => {
  try {
    const businessId = getBusinessId(req);
    
    if (!businessId) {
      return res.status(401).json({ error: 'Business ID required' });
    }

    const { month, year } = req.body;
    
    if (!month || !year) {
      return res.status(400).json({ 
        success: false, 
        error: 'Month and year are required' 
      });
    }

    const bill = await billingService.generateMonthlyBill(
      businessId,
      month,
      year
    );
    
    res.json({
      success: true,
      data: bill
    });
  } catch (error) {
    console.error('Error generating bill:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate bill' 
    });
  }
});

// Get monthly usage for specific month
router.get('/usage/:month/:year', async (req: Request, res: Response) => {
  try {
    const businessId = getBusinessId(req);
    
    if (!businessId) {
      return res.status(401).json({ error: 'Business ID required' });
    }

    const { month, year } = req.params;
    const monthNum = Number.parseInt(month || '0');
    const yearNum = Number.parseInt(year || '0');
    
    if (Number.isNaN(monthNum) || Number.isNaN(yearNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid month or year' 
      });
    }

    const usage = await db.billingUsage.findUnique({
      where: {
        businessId_month_year: {
          businessId: businessId,
          month: monthNum,
          year: yearNum
        }
      }
    });
    
    res.json({
      success: true,
      data: usage || {
        totalMinutes: 0,
        includedMinutes: 0,
        overageMinutes: 0,
        overageCost: 0,
        totalCost: 0
      }
    });
  } catch (error) {
    console.error('Error getting monthly usage:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get monthly usage' 
    });
  }
});

export default router;
