module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const pathname = new URL(req.url, `https://${req.headers.host}`).pathname;
    const topic = decodeURIComponent(pathname.split('/').pop() || 'technology');

    const key = process.env.YOUTUBE_API_KEY;
    if (!key) return res.status(500).json({ error: 'YOUTUBE_API_KEY missing' });

    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(topic)}&type=video&maxResults=9&key=${key}`;
    const r = await fetch(apiUrl);
    const data = await r.json();
    const videos = (data.items ?? []).map(it => ({
      id: it.id?.videoId,
      title: it.snippet?.title,
      description: it.snippet?.description,
      thumbnail: it.snippet?.thumbnails?.medium?.url,
      channelTitle: it.snippet?.channelTitle,
      publishedAt: it.snippet?.publishedAt,
    }));

    return res.json({ videos });
  } catch (err) {
    console.error('youtube error', err);
    return res.status(500).json({ error: err?.message || 'Failed to fetch youtube' });
  }
};


