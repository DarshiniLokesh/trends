import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import newsRouter from "./routes/news.js";
import youtubeRoutes from "./routes/youtube.js";
import redditRoutes from "./routes/reddit.js";
import redditRoutes from "./routes/reddit.ts";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

// ✅ Default route
app.get("/", (req, res) => {
  res.send("✅ PulseBoard Server is running!");
});

// ✅ Register routes
app.use("/api/news", newsRouter);
app.use("/api/youtube", youtubeRoutes);
app.use("/api/reddit", redditRoutes);
app.use("/api/reddit", redditRoutes);


// Export the Express app for Vercel serverless. Avoid listening when running on Vercel.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;
