import { Router, Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const router = Router();
const YT_API = process.env.YOUTUBE_API_KEY!;

router.get("/:topic", async (req: Request, res: Response) => {
  const { topic } = req.params;

  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${topic}&type=video&maxResults=6&key=${YT_API}`
    );

    res.json(response.data.items);
  } catch (error) {
    console.error("❌ Error fetching YouTube:", error);
    res.status(500).json({ error: "Failed to fetch YouTube videos" });
  }
});

export default router;
