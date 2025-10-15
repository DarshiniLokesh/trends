const express = require("express");
const app = express();

app.get("/api/news/:topic", async (req, res) => {
  try {
    const topic = req.params.topic;
    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    if (!NEWS_API_KEY) return res.status(500).json({ error: "NEWS_API_KEY missing" });
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`;
    const r = await fetch(url);
    const data = await r.json();
    return res.json({ success: true, count: data.articles?.length ?? 0, articles: data.articles ?? [] });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Failed to fetch news" });
  }
});

app.get("/api/youtube/:topic", async (req, res) => {
  try {
    const topic = req.params.topic;
    const YT_API = process.env.YOUTUBE_API_KEY;
    if (!YT_API) return res.status(500).json({ error: "YOUTUBE_API_KEY missing" });
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(topic)}&type=video&maxResults=9&key=${YT_API}`;
    const r = await fetch(url);
    const data = await r.json();
    const videos = (data.items ?? []).map((it) => ({
      id: it.id?.videoId,
      title: it.snippet?.title,
      description: it.snippet?.description,
      thumbnail: it.snippet?.thumbnails?.medium?.url,
      channelTitle: it.snippet?.channelTitle,
      publishedAt: it.snippet?.publishedAt,
    }));
    return res.json({ videos });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Failed to fetch YouTube" });
  }
});

app.get("/api/reddit/:topic", async (req, res) => {
  try {
    const topic = req.params.topic;
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(topic)}&limit=10`;
    const r = await fetch(url);
    const data = await r.json();
    const posts = (data?.data?.children ?? []).map((p) => ({
      title: p.data.title,
      url: `https://www.reddit.com${p.data.permalink}`,
      author: p.data.author,
      subreddit: p.data.subreddit,
      ups: p.data.ups,
      thumbnail: typeof p.data.thumbnail === "string" && p.data.thumbnail.startsWith("http") ? p.data.thumbnail : null,
    }));
    return res.json({ posts });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Failed to fetch Reddit" });
  }
});

module.exports = (req, res) => app(req, res);


