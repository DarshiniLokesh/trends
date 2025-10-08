import React, { useState } from "react";
import NewsFeed from "./components/NewsFeed";

function App() {
  const [topic, setTopic] = useState("technology");

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="flex justify-center items-center gap-2 p-4 bg-white shadow">
        <input
          type="text"
          placeholder="Search topic..."
          className="border rounded-lg px-3 py-2 w-64 focus:outline-none focus:ring focus:ring-blue-300"
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
      </div>

      <NewsFeed topic={topic} />
    </div>
  );
}

export default App;
