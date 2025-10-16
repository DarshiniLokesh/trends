module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { url, headers } = req;
    const pathname = new URL(url, `https://${headers.host}`).pathname; // /api/news/technology
    const topic = decodeURIComponent(pathname.split('/').pop() || 'technology');

    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    if (!NEWS_API_KEY) return res.status(500).json({ error: 'NEWS_API_KEY missing' });

    const apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`;
    const r = await fetch(apiUrl);
    const data = await r.json();

    return res.json({ success: true, count: data.articles?.length ?? 0, articles: data.articles ?? [] });
  } catch (err) {
    console.error('news error', err);
    return res.status(500).json({ error: err?.message || 'Failed to fetch news' });
  }
};


