import express from "express";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

const app = express();

app.get("/api/news/:topic", async (req, res) => {
  try {
    const topic = req.params.topic;
    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    if (!NEWS_API_KEY) return res.status(500).json({ error: "NEWS_API_KEY missing" });
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`;
    const { data } = await axios.get(url);
    return res.json({ success: true, count: data.articles?.length ?? 0, articles: data.articles ?? [] });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Failed to fetch news" });
  }
});

app.get("/api/youtube/:topic", async (req, res) => {
  try {
    const topic = req.params.topic;
    const YT_API = process.env.YOUTUBE_API_KEY;
    if (!YT_API) return res.status(500).json({ error: "YOUTUBE_API_KEY missing" });
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(topic)}&type=video&maxResults=9&key=${YT_API}`;
    const resp = await fetch(url);
    const data = await resp.json();
    const videos = (data.items ?? []).map((it: any) => ({
      id: it.id?.videoId,
      title: it.snippet?.title,
      description: it.snippet?.description,
      thumbnail: it.snippet?.thumbnails?.medium?.url,
      channelTitle: it.snippet?.channelTitle,
      publishedAt: it.snippet?.publishedAt,
    }));
    return res.json({ videos });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Failed to fetch YouTube" });
  }
});

app.get("/api/reddit/:topic", async (req, res) => {
  try {
    const topic = req.params.topic;
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(topic)}&limit=10`;
    const r = await fetch(url);
    const data = (await r.json()) as { data?: { children?: any[] } };
    const posts = (data?.data?.children ?? []).map((p: any) => ({
      title: p.data.title,
      url: `https://www.reddit.com${p.data.permalink}`,
      author: p.data.author,
      subreddit: p.data.subreddit,
      ups: p.data.ups,
      thumbnail: typeof p.data.thumbnail === "string" && p.data.thumbnail.startsWith("http") ? p.data.thumbnail : null,
    }));
    return res.json({ posts });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Failed to fetch Reddit" });
  }
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  return (app as any)(req, res);
}

