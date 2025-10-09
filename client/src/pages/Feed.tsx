import { useEffect, useState, useRef, useCallback } from "react";
import NewsCard from "../components/NewsCard";
import VideoCard from "../components/VideoCard";
import RedditCard from "../components/RedditCard";

interface FeedProps {
  searchTerm: string;
  category: string;
}

export default function Feed({ searchTerm, category }: FeedProps) {
  const [news, setNews] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [redditPosts, setRedditPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: any) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading]
  );

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        const API = import.meta.env.VITE_API_URL ?? "http://localhost:5050";
        const query =
          searchTerm && searchTerm.trim() ? searchTerm.trim() : category;

        const [newsRes, videoRes, redditRes] = await Promise.all([
          fetch(`${API}/api/news/${encodeURIComponent(query)}`),
          fetch(`${API}/api/youtube/${encodeURIComponent(query)}`),
          fetch(`${API}/api/reddit/${encodeURIComponent(query)}`),
        ]);

        const newsData = await newsRes.json();
        const videoData = await videoRes.json();
        const redditData = await redditRes.json();

        setNews(newsData.articles || []);
        setVideos(videoData.videos || []);
        setRedditPosts(redditData.posts || []);
      } catch (err) {
        console.error("Error fetching feed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [category, searchTerm]);

  return (
    <main className="max-w-5xl mx-auto px-4 py-6 space-y-10">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"
              ></div>
            ))}
        </div>
      ) : (
        <>
          {/* 📰 Latest News */}
          <section>
            <h2 className="text-xl font-bold mb-4">📰 Latest News</h2>
            {news.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {news.map((article, idx) => (
                  <NewsCard key={idx} article={article} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No news found.</p>
            )}
          </section>

          {/* 🎥 YouTube Videos */}
          <section ref={lastElementRef}>
            <h2 className="text-xl font-bold mb-4">🎥 Trending Videos</h2>
            {videos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((video, idx) => (
                  <VideoCard key={idx} video={video} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No videos found.
              </p>
            )}
          </section>

          {/* 🧵 Reddit Discussions */}
          <section>
            <h2 className="text-xl font-bold mb-4">🧵 Reddit Discussions</h2>
            {redditPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {redditPosts.map((post, idx) => (
                  <RedditCard key={idx} post={post} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No Reddit posts found.
              </p>
            )}
          </section>
        </>
      )}
    </main>
  );
}
