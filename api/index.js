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
      
      return res.json({ 
        success: true, 
        count: data.articles?.length ?? 0, 
        articles: data.articles ?? [] 
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
