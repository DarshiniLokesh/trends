module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const pathname = new URL(req.url, `https://${req.headers.host}`).pathname;
    const topic = decodeURIComponent(pathname.split('/').pop() || 'technology');

    // Ask Reddit for JSON explicitly and provide a User-Agent so we don't get HTML
    // Try official api.reddit.com first (tends to be less aggressively blocked)
    const apiUrlPrimary = `https://api.reddit.com/search.json?q=${encodeURIComponent(topic)}&limit=10&raw_json=1`;
    let r = await fetch(apiUrlPrimary, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TrendsBot/1.0; +https://trends.vercel.app)',
        'Accept': 'application/json',
        'Referer': 'https://www.reddit.com/'
      }
    });

    // If Reddit blocks the Vercel IP (403), retry fallbacks
    if (r.status === 403) {
      const apiUrlWeb = `https://www.reddit.com/search.json?q=${encodeURIComponent(topic)}&limit=10&raw_json=1`;
      r = await fetch(apiUrlWeb, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TrendsBot/1.0; +https://trends.vercel.app)',
          'Accept': 'application/json',
          'Referer': 'https://www.reddit.com/'
        }
      });
      if (r.status === 403) {
        const proxy = `https://r.jina.ai/http://www.reddit.com/search.json?q=${encodeURIComponent(topic)}&limit=10&raw_json=1`;
        r = await fetch(proxy);
      }
    }

    if (!r.ok) {
      const body = await r.text();
      // Graceful degrade: return empty list instead of error to keep UI working
      return res.status(200).json({ posts: [], note: 'Reddit blocked the request; returning empty list', debug: body.slice(0, 120) });
    }

    // Read ONCE, then try to parse as JSON
    const bodyText = await r.text();
    let data;
    try {
      data = JSON.parse(bodyText);
    } catch (e) {
      return res.status(200).json({ posts: [], note: 'Reddit returned non-JSON; returning empty list', debug: bodyText.slice(0, 120) });
    }
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


