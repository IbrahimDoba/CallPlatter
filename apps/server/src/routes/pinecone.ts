import { Router } from "express";
import { storeChunks, searchByText, searchCustomerInfo, deleteImportVectors, getVectorStats } from "../services/pineconeService";
import { logger } from "../utils/logger";

const router: Router = Router();

// POST /api/pinecone/store
router.post("/store", async (req, res) => {
  try {
    const { businessId, importId, chunks, embeddings } = req.body;

    if (!businessId || !importId || !chunks || !embeddings) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await storeChunks(businessId, importId, chunks, embeddings);

    res.json({ success: true, message: "Vectors stored successfully" });
  } catch (error) {
    logger.error("Error storing vectors in Pinecone:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ 
      error: "Failed to store vectors",
      details: errorMessage 
    });
  }
});

// POST /api/pinecone/search
router.post("/search", async (req, res) => {
  try {
    const { businessId, phoneNumber, queryEmbedding, topK = 5 } = req.body;

    if (!businessId) {
      return res.status(400).json({ error: "businessId is required" });
    }

    let results: any;
    if (phoneNumber) {
      // Use the new customer search function for better accuracy
      results = await searchCustomerInfo(businessId, phoneNumber, topK);
    } else if (queryEmbedding) {
      results = await searchByText(businessId, queryEmbedding, topK);
    } else {
      return res.status(400).json({ error: "Either phoneNumber or queryEmbedding is required" });
    }

    res.json({ results });
  } catch (error) {
    logger.error("Error searching Pinecone:", error);
    res.status(500).json({ error: "Failed to search vectors" });
  }
});

// DELETE /api/pinecone/import/:businessId/:importId
router.delete("/import/:businessId/:importId", async (req, res) => {
  try {
    const { businessId, importId } = req.params;

    await deleteImportVectors(businessId, importId);

    res.json({ success: true, message: "Import vectors deleted successfully" });
  } catch (error) {
    logger.error("Error deleting import vectors:", error);
    res.status(500).json({ error: "Failed to delete vectors" });
  }
});

// GET /api/pinecone/stats/:businessId
router.get("/stats/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;

    const stats = await getVectorStats(businessId);

    res.json({ stats });
  } catch (error) {
    logger.error("Error getting vector stats:", error);
    res.status(500).json({ error: "Failed to get vector stats" });
  }
});

export default router;
