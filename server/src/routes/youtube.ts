import express from "express";
import type { Request, Response } from "express";
import fetch from "node-fetch";
import { summarizeWithMCP } from "../utils/summarizeWithMCP.ts";

const router = express.Router();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY as string;

router.get("/:topic", async (req: Request, res: Response) => {
  const topic = req.params.topic;

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      topic
    )}&type=video&maxResults=10&key=${YOUTUBE_API_KEY}`;

    const response = await fetch(url);
    const data: { items?: any[] } = await response.json();

    if (!data.items) {
      return res
        .status(500)
        .json({ success: false, error: "No videos found or quota exceeded" });
    }

    const videos = data.items.map((item: any) => ({
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.high?.url,
      publishedAt: item.snippet.publishedAt,
      videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      description: item.snippet.description,
    }));

    // Use your MCP summarizer
    const summary = await summarizeWithMCP(videos);

    res.json({
      success: true,
      count: videos.length,
      summary,
      videos,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch YouTube videos",
    });
  }
});

export default router;
