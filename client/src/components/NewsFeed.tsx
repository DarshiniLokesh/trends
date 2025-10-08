import React, { useEffect, useState } from "react";
import { fetchNews } from "../api/newsApi";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await fetchNews(topic);
      setNews(data);
      setLoading(false);
    })();
  }, [topic]);

  if (loading) return <p className="text-gray-500 p-4">Loading news...</p>;
  if (!news) return <p className="text-red-500 p-4">Failed to load news.</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">
        🗞️ Trending News on {topic}
      </h1>
      <p className="text-gray-700 italic mb-6">
        🧠 Summary: {news.summary.summary}
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        {news.summary.tags.map((tag, i) => (
          <span
            key={i}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-full"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="grid gap-6">
        {news.articles.map((article, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition"
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
              className="text-xl font-semibold text-blue-700 hover:underline"
            >
              {article.title}
            </a>
            <p className="text-sm text-gray-500 mt-1">{article.source.name}</p>
            <p className="text-gray-700 mt-2">{article.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
