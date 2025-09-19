import { Router } from "express";
import { EmbeddingsService } from "../services/embeddingsService";
import { logger } from "../utils/logger";

const router: Router = Router();

// POST /api/embeddings
router.post("/", async (req, res) => {
  try {
    const { texts } = req.body;

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ error: "Texts array is required" });
    }

    const embeddings = await EmbeddingsService.generateEmbeddings(texts);

    res.json({ embeddings });
  } catch (error) {
    logger.error("Error generating embeddings:", error);
    res.status(500).json({ error: "Failed to generate embeddings" });
  }
});

export default router;
