import React, { useEffect, useState, useRef } from "react";
import { fetchNews } from "../api/newsApi";
import SkeletonCard from "./SkeletonCard";

interface Article {
  title: string;
  description: string;
  url: string;
  source: { name: string };
  urlToImage?: string;
}

interface NewsData {
  summary: { summary: string; tags: string[] };
  articles: Article[];
}

export default function NewsFeed({ topic = "AI" }: { topic?: string }) {
  const [news, setNews] = useState<NewsData | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchNews(topic);
      setNews(data);
      setVisibleCount(5);
      setLoading(false);
    })();
  }, [topic]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300
      ) {
        setVisibleCount((prev) => prev + 5);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading)
    return (
      <div className="grid gap-6 p-6 max-w-5xl mx-auto">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );

  if (!news) return <p className="text-red-500 p-4">Failed to load news.</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">🗞️ Trending on {topic}</h1>
      <p className="italic mb-4 text-gray-600 dark:text-gray-300">
        🧠 {news.summary.summary}
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        {news.summary.tags.map((tag, i) => (
          <span
            key={i}
            className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-100 rounded-full"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="grid gap-6">
        {news.articles.slice(0, visibleCount).map((article, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow hover:shadow-lg transition"
          >
            {article.urlToImage && (
              <img
                src={article.urlToImage}
                alt=""
                className="rounded-xl mb-3 max-h-60 w-full object-cover"
              />
            )}
            <a
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="text-xl font-semibold text-blue-700 dark:text-blue-300 hover:underline"
            >
              {article.title}
            </a>
            <p className="text-sm text-gray-500 mt-1">{article.source.name}</p>
            <p className="text-gray-700 dark:text-gray-200 mt-2">{article.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
