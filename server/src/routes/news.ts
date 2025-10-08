import express from "express";
import type { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
import { summarizeWithMCP } from "../utils/summarizeWithMCP.ts";

dotenv.config();

const router = express.Router();
const NEWS_API_KEY = process.env.NEWS_API_KEY;

router.get("/:topic", async (req: Request, res: Response) => {
  const topic = req.params.topic;

  try {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      topic
    )}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`;

    const response = await axios.get(url);
    const articles = response.data.articles;

    // ✅ Summarize with MCP
    const summary = await summarizeWithMCP(articles);

    res.json({
      success: true,
      count: articles.length,
      summary,
      articles,
    });
  } catch (error: any) {
    console.error("❌ Error fetching news:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch news" });
  }
});

export default router;
