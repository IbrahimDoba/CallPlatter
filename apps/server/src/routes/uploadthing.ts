import { Router, type Request, type Response } from "express";
import { uploadFileToUploadThing, downloadAndUploadToUploadThing } from "../lib/uploadthing";
import { logger } from "../utils/logger";
import multer from "multer";

const router: Router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 32 * 1024 * 1024, // 32MB limit
  },
});

// Upload file endpoint
router.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const { filename, mimetype, buffer } = req.file;

    const result = await uploadFileToUploadThing(buffer, filename, mimetype);

    res.json({
      success: true,
      url: result.url,
      key: result.key,
    });
  } catch (error) {
    logger.error("Upload endpoint error", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    });
  }
});

// Download from URL and upload to UploadThing
router.post("/upload-from-url", async (req: Request, res: Response) => {
  try {
    const { url, filename, contentType } = req.body;

    if (!url || !filename) {
      return res.status(400).json({ error: "URL and filename are required" });
    }

    const result = await downloadAndUploadToUploadThing(url, filename, contentType);

    res.json({
      success: true,
      url: result.url,
      key: result.key,
    });
  } catch (error) {
    logger.error("Upload from URL endpoint error", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    });
  }
});


export default router;
