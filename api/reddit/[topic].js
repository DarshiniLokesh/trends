module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const pathname = new URL(req.url, `https://${req.headers.host}`).pathname;
    const topic = decodeURIComponent(pathname.split('/').pop() || 'technology');

    const apiUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(topic)}&limit=10`;
    const r = await fetch(apiUrl);
    const data = await r.json();
    const posts = (data?.data?.children ?? []).map(p => ({
      title: p.data.title,
      url: `https://www.reddit.com${p.data.permalink}`,
      author: p.data.author,
      subreddit: p.data.subreddit,
      ups: p.data.ups,
      thumbnail: typeof p.data.thumbnail === 'string' && p.data.thumbnail.startsWith('http') ? p.data.thumbnail : null,
    }));

    return res.json({ posts });
  } catch (err) {
    console.error('reddit error', err);
    return res.status(500).json({ error: err?.message || 'Failed to fetch reddit' });
  }
};


