let cachedToken = null;
let cachedTokenExpiry = 0;

async function getRedditToken() {
  try {
    const now = Date.now();
    if (cachedToken && now < cachedTokenExpiry - 30_000) return cachedToken;
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;
    if (!clientId || !clientSecret) return null;
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const resp = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'TrendsApp/1.0 (+https://trends.vercel.app)'
      },
      body: 'grant_type=client_credentials&scope=read'
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    cachedToken = data.access_token;
    cachedTokenExpiry = Date.now() + (data.expires_in || 3600) * 1000;
    return cachedToken;
  } catch (_) {
    return null;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const pathname = new URL(req.url, `https://${req.headers.host}`).pathname;
    const topic = decodeURIComponent(pathname.split('/').pop() || 'technology');

    // Prefer OAuth if available for reliability
    const token = await getRedditToken();
    if (token) {
      const rAuth = await fetch(`https://oauth.reddit.com/search?q=${encodeURIComponent(topic)}&limit=10&type=link&sort=relevance&raw_json=1`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'TrendsApp/1.0 (+https://trends.vercel.app)',
          'Accept': 'application/json'
        }
      });
      if (rAuth.ok) {
        const data = await rAuth.json();
        const posts = (data?.data?.children ?? []).map(p => ({
          title: p.data.title,
          url: `https://www.reddit.com${p.data.permalink}`,
          author: p.data.author,
          subreddit: p.data.subreddit,
          ups: p.data.ups,
          thumbnail: typeof p.data.thumbnail === 'string' && p.data.thumbnail.startsWith('http') ? p.data.thumbnail : null,
        }));
        return res.json({ posts, auth: true });
      }
      // fall through to anonymous if oauth fails; return diagnostic instead of 500
      const failBody = await rAuth.text();
      return res.status(200).json({ posts: [], auth: false, note: 'oauth_failed', status: rAuth.status, sample: failBody.slice(0, 160) });
    }

    // Anonymous attempt (may be blocked)
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
      // Return diagnostics instead of 500
      return res.status(200).json({ posts: [], note: 'blocked_or_error', status: r.status, sample: body.slice(0, 160) });
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


