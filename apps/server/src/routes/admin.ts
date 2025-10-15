import { Router } from 'express';
import { db } from '@repo/db';
import { logger } from '../utils/logger';

const router: Router = Router();

// Get all users with their details for admin dashboard
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build search conditions
    const searchConditions = search ? {
      OR: [
        { name: { contains: search as string, mode: 'insensitive' as const } },
        { email: { contains: search as string, mode: 'insensitive' as const } }
      ]
    } : {};

    // Get users with their business and subscription details
    const [users, total] = await Promise.all([
      db.user.findMany({
        where: searchConditions,
        skip,
        take: Number(limit),
        include: {
          business: {
            include: {
              subscription: true,
              _count: {
                select: {
                  calls: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      db.user.count({ where: searchConditions })
    ]);

    // Format the response
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.business?.phoneNumber || null,
      createdAt: user.createdAt,
      business: user.business ? {
        id: user.business.id,
        name: user.business.name,
        phoneNumber: user.business.phoneNumber,
        totalCalls: user.business._count.calls,
        subscription: user.business.subscription ? {
          id: user.business.subscription.id,
          planType: user.business.subscription.planType,
          status: user.business.subscription.status,
          minutesUsed: user.business.subscription.minutesUsed,
          minutesIncluded: user.business.subscription.minutesIncluded,
          currentPeriodStart: user.business.subscription.currentPeriodStart,
          currentPeriodEnd: user.business.subscription.currentPeriodEnd
        } : null
      } : null
    }));

    res.json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching users for admin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// Get admin dashboard statistics
router.get('/stats', async (_req, res) => {
  try {
    // Get total users
    const totalUsers = await db.user.count();

    // Get total businesses
    const totalBusinesses = await db.business.count();

    // Get total calls
    const totalCalls = await db.call.count();

    // Get calls today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const callsToday = await db.call.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    });

    // Get active subscriptions
    const activeSubscriptions = await db.subscription.count({
      where: {
        status: 'ACTIVE'
      }
    });

    // Get users by subscription plan
    const usersByPlan = await db.subscription.groupBy({
      by: ['planType'],
      _count: {
        planType: true
      }
    });

    // Get recent users (last 5)
    const recentUsers = await db.user.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        business: {
          select: {
            name: true,
            phoneNumber: true,
            _count: {
              select: {
                calls: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalBusinesses,
        totalCalls,
        callsToday,
        activeSubscriptions,
        usersByPlan,
        recentUsers
      }
    });

  } catch (error) {
    logger.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin statistics'
    });
  }
});

export default router;
