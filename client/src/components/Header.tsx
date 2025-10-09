interface HeaderProps {
    darkMode: boolean;
    setDarkMode: (v: boolean) => void;
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    setCategory: (v: string) => void;
  }
  
  const categories = [
    "technology",
    "sports",
    "entertainment",
    "business",
    "science",
    "health"
  ];
  
  export default function Header({
    darkMode,
    setDarkMode,
    searchTerm,
    setSearchTerm,
    setCategory
  }: HeaderProps) {
    return (
      <header className="flex flex-col items-center gap-4 py-4 shadow-md sticky top-0 z-10 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between w-full max-w-5xl px-4">
          <h1 className="text-2xl font-bold">Trending Feed</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-1 rounded-md border dark:border-gray-600"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
  
        <div className="flex w-full max-w-5xl px-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search topics..."
            className="flex-grow px-4 py-2 rounded-l-md border dark:bg-gray-700 dark:border-gray-600"
          />
          <button
            onClick={() => setCategory(searchTerm || "technology")}
            className="px-4 py-2 bg-blue-600 text-white rounded-r-md"
          >
            Search
          </button>
        </div>
  
        <div className="flex gap-2 flex-wrap justify-center px-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="px-3 py-1 rounded-full text-sm border border-gray-300 dark:border-gray-600 hover:bg-blue-600 hover:text-white transition"
            >
              {cat}
            </button>
          ))}
        </div>
      </header>
    );
  }
  