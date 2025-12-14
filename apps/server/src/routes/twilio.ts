import { Router } from "express";
import { twilioService } from "../services/twilioService";
import { apiLimiter } from "../middleware/rateLimiter";

const router: Router = Router();

// Get available phone numbers
router.get("/available-numbers", apiLimiter, async (req, res) => {
  try {
    const {
      countryCode = "US",
      areaCode,
      page = "1",
      limit = "10",
    } = req.query;

    const pageNum = Number.parseInt(page as string, 10);
    const limitNum = Number.parseInt(limit as string, 10);

    // Validate pagination parameters
    if (pageNum < 1 || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        ok: false,
        error:
          "Invalid pagination parameters. Page must be >= 1, limit must be between 1-50",
      });
    }

    const result = await twilioService.getAvailableNumbers(
      countryCode as string,
      areaCode as string,
      pageNum,
      limitNum
    );

    res.json({
      ok: true,
      data: result.numbers,
      pagination: {
        currentPage: pageNum,
        limit: limitNum,
        totalPages: result.pagination.totalPages,
        hasNextPage: result.pagination.hasNextPage,
        hasPrevPage: result.pagination.hasPrevPage,
        totalCount: result.pagination.totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching available numbers:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to fetch available phone numbers",
    });
  }
});

// Purchase phone number
router.post("/purchase-number", apiLimiter, async (req, res) => {
  try {
    const { phoneNumber, friendlyName } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        ok: false,
        error: "Phone number is required",
      });
    }

    // Determine the webhook URL based on environment
    let webhookUrl: string;

    if (process.env.NODE_ENV === "production") {
      // Production: use the actual domain
      webhookUrl = `${process.env.SERVER_URL || "https://yourdomain.com"}/api/elevenlabs-agent/incoming-call`;
    } else {
      // Development: use ngrok URL or fallback to localhost with warning
      const ngrokUrl = process.env.NGROK_URL;
      if (ngrokUrl) {
        webhookUrl = `${ngrokUrl}/api/elevenlabs-agent/incoming-call`;
      } else {
        return res.status(400).json({
          ok: false,
          error:
            "NGROK_URL environment variable is required for development. Please set up ngrok and add NGROK_URL to your server environment variables.",
        });
      }
    }

    console.log("Using webhook URL:", webhookUrl);

    const purchasedNumber = await twilioService.purchaseNumber(
      phoneNumber,
      webhookUrl,
      friendlyName
    );

    res.json({
      ok: true,
      data: purchasedNumber,
    });
  } catch (error) {
    console.error("Error purchasing number:", error);

    // Handle specific Twilio errors
    if (error instanceof Error && error.message.includes("not available")) {
      return res.status(400).json({
        ok: false,
        error:
          "This phone number is no longer available. Please select a different number.",
        code: "NUMBER_NOT_AVAILABLE",
      });
    }

    res.status(500).json({
      ok: false,
      error: "Failed to purchase phone number",
    });
  }
});

// Transfer endpoint - Returns TwiML to dial the transfer number
router.post("/transfer", async (req, res) => {
  const { number } = req.query;

  console.log("📞 Transfer endpoint called", {
    number,
    query: req.query,
    headers: req.headers,
  });

  if (!number || typeof number !== "string") {
    console.error("❌ Transfer failed: No number provided");
    return res.status(400).send(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say>Transfer failed: No phone number provided.</Say>
        <Hangup/>
      </Response>`
    );
  }

  console.log("✅ Returning transfer TwiML for number:", number);

  // Return TwiML to transfer the call
  res.type("text/xml");
  res.send(
    `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say>Transferring you to a human agent now.</Say>
      <Dial>${number}</Dial>
    </Response>`
  );
});

export default router;
