import { Router, Request, Response } from "express";
import axios from "axios";

const router = Router();

router.get("/:topic", async (req: Request, res: Response) => {
  const { topic } = req.params;

  try {
    const response = await axios.get(
      `https://www.reddit.com/search.json?q=${topic}&limit=6`,
      { headers: { "User-Agent": "pulseboard-app/1.0" } }
    );

    const posts = response.data.data.children.map((post: any) => ({
      title: post.data.title,
      url: `https://www.reddit.com${post.data.permalink}`,
      subreddit: post.data.subreddit,
      ups: post.data.ups,
    }));

    res.json(posts);
  } catch (error) {
    console.error("❌ Error fetching Reddit:", error);
    res.status(500).json({ error: "Failed to fetch Reddit posts" });
  }
});

export default router;
