module.exports = async (req, res) => {
  try {
    // Extract topic from URL path like /api/youtube/technology
    const urlPath = new URL(req.url, `https://${req.headers.host}`).pathname;
    const topic = urlPath.split('/').pop();
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    
    if (!YOUTUBE_API_KEY) {
      return res.status(500).json({ error: "YOUTUBE_API_KEY missing" });
    }
    
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(topic)}&type=video&maxResults=9&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    const videos = (data.items ?? []).map((item) => ({
      id: item.id?.videoId,
      title: item.snippet?.title,
      description: item.snippet?.description,
      thumbnail: item.snippet?.thumbnails?.medium?.url,
      channelTitle: item.snippet?.channelTitle,
      publishedAt: item.snippet?.publishedAt,
    }));
    
    return res.json({ videos });
  } catch (error) {
    console.error('YouTube API error:', error);
    return res.status(500).json({ error: error?.message || "Failed to fetch YouTube videos" });
  }
};
