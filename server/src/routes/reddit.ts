import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/:topic", async (req, res) => {
  const topic = req.params.topic;
  try {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(topic)}&limit=10`;
    const response = await fetch(url);
    const data = (await response.json()) as { data?: { children?: any[] } };
    const children = data?.data?.children ?? [];

    const posts = children.map((p: any) => ({
      title: p.data.title,
      url: `https://www.reddit.com${p.data.permalink}`,
      author: p.data.author,
      subreddit: p.data.subreddit,
      ups: p.data.ups,
      thumbnail: p.data.thumbnail?.startsWith("http") ? p.data.thumbnail : null,
    }));

    res.json({ posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch Reddit data" });
  }
});

export default router;
