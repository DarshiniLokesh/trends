module.exports = async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  console.log('API called with URL:', req.url);
  console.log('API called with method:', req.method);
  
  const url = new URL(req.url, `https://${req.headers.host}`);
  const path = url.pathname;

  // Helper: Perplexity summaries (OpenAI-compatible API)
  async function summarizeWithPerplexity({ items, topic, kind }) {
    try {
      const key = process.env.PERPLEXITY_API_KEY;
      if (!key) return null;

      const contentList = (items || []).map((it) =>
        kind === 'news' ? `- ${it.title} (${it.source?.name || 'source unknown'})`
                        : `- ${it.title} (${it.channelTitle || 'channel'})`
      ).slice(0, 12);

      const wantBullets = kind === 'youtube';
      const messages = [
        {
          role: 'system',
          content: wantBullets
            ? 'You are a world‑class curator. From video titles, produce 4–7 crisp bullet takeaways (no fluff), each ≤18 words, plus 4–8 lowercase topic tags (single words). Output pure JSON {"bullets": string[], "tags": string[]}. No prose outside JSON.'
            : 'You are a world‑class editor. From headlines, produce a 2–3 sentence executive summary (no hype) and 4–8 lowercase topic tags (single words). Output pure JSON {"summary": string, "tags": string[]}. No prose outside JSON.'
        },
        {
          role: 'user',
          content: `topic: ${topic}\nkind: ${kind}\nitems:\n${contentList.join('\n')}`
        }
      ];

      const resp = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          temperature: 0.2,
          max_tokens: 400,
          messages
        })
      });
      if (!resp.ok) return null;
      const data = await resp.json();
      const text = data?.choices?.[0]?.message?.content || '';
      // Try fenced JSON first
      let jsonString = '';
      const fenced = text.match(/```\s*json\s*([\s\S]*?)```/i);
      if (fenced && fenced[1]) jsonString = fenced[1];
      if (!jsonString) {
        const inline = text.match(/\{[\s\S]*\}/);
        if (inline) jsonString = inline[0];
      }
      if (!jsonString) return { summary: text.slice(0, 320), tags: [] };
      const parsed = JSON.parse(jsonString);
      let summaryText = '';
      if (Array.isArray(parsed.bullets)) {
        summaryText = parsed.bullets.map(b => `• ${String(b)}`).join(' ');
      } else if (typeof parsed.summary === 'string') {
        summaryText = parsed.summary;
      } else {
        summaryText = text.slice(0, 320) || '';
      }
      return {
        summary: summaryText,
        tags: Array.isArray(parsed.tags) ? parsed.tags.map(t => String(t).toLowerCase()).slice(0, 8) : []
      };
    } catch (_) {
      return null;
    }
  }
  
  // Route to different handlers based on path
  if (path === '/api/test') {
    return res.json({ message: 'Test API is working!', timestamp: new Date().toISOString() });
  }
  
  if (path.startsWith('/api/news/')) {
    const topic = path.split('/').pop();
    console.log('News API - topic:', topic);
    
    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    if (!NEWS_API_KEY) {
      return res.status(500).json({ error: "NEWS_API_KEY missing" });
    }
    
    try {
      const newsUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`;
      const response = await fetch(newsUrl);
      const data = await response.json();
      const articles = data.articles ?? [];

      // Lightweight summary and tags
      // Prefer Perplexity summarization when available
      let summary = '', tags = [];
      const mcp = await summarizeWithPerplexity({ items: articles, topic, kind: 'news' });
      if (mcp) {
        summary = mcp.summary;
        tags = mcp.tags;
      } else {
        const titles = articles.slice(0, 8).map(a => a.title).filter(Boolean);
        summary = titles.length
          ? `Top ${titles.length} headlines on ${topic}: ` + titles.join('; ')
          : `No recent headlines found for ${topic}.`;
        tags = Array.from(new Set(
          titles
            .join(' ')
            .toLowerCase()
            .match(/[#@]?\w{4,}/g) || []
        )).slice(0, 6);
      }

      return res.json({ 
        success: true,
        summary,
        tags,
        count: articles.length,
        articles
      });
    } catch (error) {
      console.error('News API error:', error);
      return res.status(500).json({ error: error?.message || "Failed to fetch news" });
    }
  }
  
  if (path.startsWith('/api/youtube/')) {
    const topic = path.split('/').pop();
    console.log('YouTube API - topic:', topic);
    
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    if (!YOUTUBE_API_KEY) {
      return res.status(500).json({ error: "YOUTUBE_API_KEY missing" });
    }
    
    try {
      const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(topic)}&type=video&maxResults=9&key=${YOUTUBE_API_KEY}`;
      const response = await fetch(youtubeUrl);
      const data = await response.json();

      const videos = (data.items ?? []).map((item) => {
        let safeTitle = item.snippet?.title || '';
        try {
          // Some sources provide URL-encoded titles; decode when possible
          safeTitle = decodeURIComponent(safeTitle);
        } catch (_) {}
        return {
          id: item.id?.videoId,
          title: safeTitle,
          description: item.snippet?.description,
          thumbnail: item.snippet?.thumbnails?.medium?.url,
          channelTitle: item.snippet?.channelTitle,
          publishedAt: item.snippet?.publishedAt,
        };
      });
      let summary = '', tags = [];
      const mcp = await summarizeWithPerplexity({ items: videos, topic, kind: 'youtube' });
      if (mcp) {
        summary = mcp.summary;
        tags = mcp.tags;
      } else {
        summary = videos.length
          ? `Trending ${topic} videos: ` + videos.slice(0, 6).map(v => v.title).join('; ')
          : `No trending ${topic} videos right now.`;
        tags = Array.from(new Set(
          videos.map(v => v.title).join(' ').toLowerCase().match(/[#@]?\w{4,}/g) || []
        )).slice(0, 6);
      }

      return res.json({ summary, tags, videos });
    } catch (error) {
      console.error('YouTube API error:', error);
      return res.status(500).json({ error: error?.message || "Failed to fetch YouTube videos" });
    }
  }
  
  if (path.startsWith('/api/reddit/')) {
    const topic = path.split('/').pop();
    console.log('Reddit API - topic:', topic);
    
    try {
      const redditUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(topic)}&limit=10`;
      const response = await fetch(redditUrl);
      const data = await response.json();
      
      const posts = (data?.data?.children ?? []).map((post) => ({
        title: post.data.title,
        url: `https://www.reddit.com${post.data.permalink}`,
        author: post.data.author,
        subreddit: post.data.subreddit,
        ups: post.data.ups,
        thumbnail: typeof post.data.thumbnail === "string" && post.data.thumbnail.startsWith("http") ? post.data.thumbnail : null,
      }));
      
      return res.json({ posts });
    } catch (error) {
      console.error('Reddit API error:', error);
      return res.status(500).json({ error: error?.message || "Failed to fetch Reddit posts" });
    }
  }
  
  // Default response for unknown routes
  return res.status(404).json({ error: 'API endpoint not found' });
};
