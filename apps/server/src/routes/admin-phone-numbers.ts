import { Router } from "express";
import { db } from "@repo/db";
import { authLimiter } from "../middleware/rateLimiter";

const router: Router = Router();

// Get all phone numbers (admin only)
router.get("/", /* authLimiter, */ async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string || "";
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};

    // Add search functionality
    if (search) {
      whereClause.number = {
        contains: search,
        mode: 'insensitive'
      };
    }

    // Get total count for pagination
    const totalCount = await db.phoneNumber.count({
      where: whereClause,
    });

    // Get paginated results
    const phoneNumbers = await db.phoneNumber.findMany({
      where: whereClause,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      ok: true,
      data: phoneNumbers,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching phone numbers:", error);
    res.status(500).json({ error: "Failed to fetch phone numbers" });
  }
});

// Get available phone numbers (for onboarding)
router.get("/available", /* authLimiter, */ async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || "";
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      isActive: true,
      isAssigned: false,
    };

    // Add search functionality
    if (search) {
      whereClause.number = {
        contains: search,
        mode: 'insensitive'
      };
    }

    // Get total count for pagination
    const totalCount = await db.phoneNumber.count({
      where: whereClause,
    });

    // Get paginated results
    const availableNumbers = await db.phoneNumber.findMany({
      where: whereClause,
      select: {
        id: true,
        number: true,
        countryCode: true,
      },
      orderBy: {
        createdAt: "asc",
      },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      ok: true,
      data: availableNumbers,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching available phone numbers:", error);
    res.status(500).json({ error: "Failed to fetch available phone numbers" });
  }
});

// Add new phone number (admin only)
router.post("/", /* authLimiter, */ async (req, res) => {
  try {

    const { number } = req.body;

    if (!number) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    // Check if number already exists
    const existingNumber = await db.phoneNumber.findUnique({
      where: { number },
    });

    if (existingNumber) {
      return res.status(400).json({ error: "Phone number already exists" });
    }

    const phoneNumber = await db.phoneNumber.create({
      data: {
        number,
        countryCode: number.substring(0, 4), // Extract country code from full number
      },
    });

    res.status(201).json({
      ok: true,
      data: phoneNumber,
    });
  } catch (error) {
    console.error("Error creating phone number:", error);
    res.status(500).json({ error: "Failed to create phone number" });
  }
});

// Update phone number (admin only)
router.put("/:id", /* authLimiter, */ async (req, res) => {
  try {

    const { id } = req.params;
    const { number, isActive } = req.body;

    const phoneNumber = await db.phoneNumber.update({
      where: { id },
      data: {
        ...(number && { 
          number,
          countryCode: number.substring(0, 4) // Extract country code from full number
        }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      ok: true,
      data: phoneNumber,
    });
  } catch (error) {
    console.error("Error updating phone number:", error);
    res.status(500).json({ error: "Failed to update phone number" });
  }
});

// Delete phone number (admin only)
router.delete("/:id", /* authLimiter, */ async (req, res) => {
  try {

    const { id } = req.params;

    // Check if number is assigned to a business
    const phoneNumber = await db.phoneNumber.findUnique({
      where: { id },
      include: {
        business: true,
      },
    });

    if (!phoneNumber) {
      return res.status(404).json({ error: "Phone number not found" });
    }

    if (phoneNumber.isAssigned && phoneNumber.business) {
      return res.status(400).json({ 
        error: "Cannot delete phone number that is assigned to a business" 
      });
    }

    await db.phoneNumber.delete({
      where: { id },
    });

    res.json({
      ok: true,
      message: "Phone number deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting phone number:", error);
    res.status(500).json({ error: "Failed to delete phone number" });
  }
});

// Assign phone number to business (admin only)
router.post("/:id/assign", /* authLimiter, */ async (req, res) => {
  try {

    const { id } = req.params;
    const { businessId } = req.body;

    if (!businessId) {
      return res.status(400).json({ error: "Business ID is required" });
    }

    // Check if phone number exists and is available
    const phoneNumber = await db.phoneNumber.findUnique({
      where: { id },
    });

    if (!phoneNumber) {
      return res.status(404).json({ error: "Phone number not found" });
    }

    if (phoneNumber.isAssigned) {
      return res.status(400).json({ error: "Phone number is already assigned" });
    }

    // Check if business exists
    const business = await db.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    // Assign the phone number
    const updatedPhoneNumber = await db.phoneNumber.update({
      where: { id },
      data: {
        isAssigned: true,
        assignedTo: businessId,
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Update business phone number
    await db.business.update({
      where: { id: businessId },
      data: {
        phoneNumber: phoneNumber.number,
        phoneNumberId: phoneNumber.id,
      },
    });

    res.json({
      ok: true,
      data: updatedPhoneNumber,
    });
  } catch (error) {
    console.error("Error assigning phone number:", error);
    res.status(500).json({ error: "Failed to assign phone number" });
  }
});

// Unassign phone number from business (admin only)
router.post("/:id/unassign", /* authLimiter, */ async (req, res) => {
  try {

    const { id } = req.params;

    const phoneNumber = await db.phoneNumber.findUnique({
      where: { id },
      include: {
        business: true,
      },
    });

    if (!phoneNumber) {
      return res.status(404).json({ error: "Phone number not found" });
    }

    if (!phoneNumber.isAssigned) {
      return res.status(400).json({ error: "Phone number is not assigned" });
    }

    // Unassign the phone number
    const updatedPhoneNumber = await db.phoneNumber.update({
      where: { id },
      data: {
        isAssigned: false,
        assignedTo: null,
      },
    });

    // Update business to remove phone number reference
    if (phoneNumber.business) {
      await db.business.update({
        where: { id: phoneNumber.business.id },
        data: {
          phoneNumberId: null,
        },
      });
    }

    res.json({
      ok: true,
      data: updatedPhoneNumber,
    });
  } catch (error) {
    console.error("Error unassigning phone number:", error);
    res.status(500).json({ error: "Failed to unassign phone number" });
  }
});

export default router;
