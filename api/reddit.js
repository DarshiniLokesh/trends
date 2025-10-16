module.exports = async (req, res) => {
  try {
    const topic = req.url.split('/').pop();
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
