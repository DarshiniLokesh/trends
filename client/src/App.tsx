import { useState } from "react";
import Feed from "./pages/Feed";
import Header from "./components/Header";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [category, setCategory] = useState("technology");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className={darkMode ? "dark bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}>
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setCategory={setCategory}
      />
      <Feed searchTerm={searchTerm} category={category} />
    </div>
  );
}
