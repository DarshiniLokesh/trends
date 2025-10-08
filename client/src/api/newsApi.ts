import axios from "axios";

const API_BASE = "http://localhost:5050/api"; 

export const fetchNews = async (topic: string) => {
  try {
    const res = await axios.get(`${API_BASE}/news/${topic}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching news:", error);
    return null;
  }
};
