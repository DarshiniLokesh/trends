module.exports = async (req, res) => {
  try {
    // Extract topic from URL path like /api/news/technology
    const urlPath = new URL(req.url, `https://${req.headers.host}`).pathname;
    const topic = urlPath.split('/').pop();
    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    
    if (!NEWS_API_KEY) {
      return res.status(500).json({ error: "NEWS_API_KEY missing" });
    }
    
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`;
    const response = await fetch(url);
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
};
