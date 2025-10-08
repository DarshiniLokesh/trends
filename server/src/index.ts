import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import newsRouter from "./routes/news.ts";

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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
