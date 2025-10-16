module.exports = async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    console.log('Reddit API called with URL:', req.url);
    // Extract topic from URL path like /api/reddit/technology
    const urlPath = new URL(req.url, `https://${req.headers.host}`).pathname;
    const topic = urlPath.split('/').pop();
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(topic)}&limit=10`;
    const response = await fetch(url);
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
};
