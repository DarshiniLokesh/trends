import React, { useState, useEffect } from "react";
import NewsFeed from "./components/NewsFeed";

export default function App() {
  const [topic, setTopic] = useState("technology");
  const [dark, setDark] = useState(false);
  const categories = ["Technology", "AI", "Finance", "Sports", "Health", "Crypto"];

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className={`min-h-screen ${dark ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"}`}>
      {/* Header */}
      <div className="flex justify-between items-center gap-2 p-4 bg-white dark:bg-gray-800 shadow">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search topic..."
            className="border rounded-lg px-3 py-2 w-64 focus:outline-none focus:ring focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600"
            onKeyDown={(e) => {
              if (e.key === "Enter") setTopic(e.currentTarget.value);
            }}
          />
          <button
            onClick={() => setTopic(topic)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Search
          </button>
          <div className="flex gap-3 justify-center flex-wrap mt-4">
  {categories.map((cat) => (
    <button
      key={cat}
      onClick={() => setTopic(cat.toLowerCase())}
      className={`px-4 py-2 rounded-full border ${
        topic === cat.toLowerCase()
          ? "bg-blue-600 text-white"
          : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300 hover:bg-blue-100"
      }`}
    >
      {cat}
    </button>
  ))}
</div>


        </div>

        {/* 🌙 Dark mode toggle */}
        <button
          onClick={() => setDark(!dark)}
          className="px-4 py-2 rounded-lg border dark:border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {dark ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      <NewsFeed topic={topic} />
    </div>
  );
}
