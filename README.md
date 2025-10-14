# Trends - Multi-Platform Content Aggregator

A modern web application that aggregates trending content from News APIs, YouTube, and Reddit with AI-powered summarization.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- API Keys: News API, YouTube Data API (optional: Perplexity for AI summaries)

### Development Setup

1. **Clone and install dependencies**
   ```bash
   git clone <your-repo>
   cd trends
   npm install  # Root dependencies
   cd client && npm install  # Client dependencies  
   cd ../server && npm install  # Server dependencies
   ```

2. **Environment Setup**
   ```bash
   # Server (.env)
   NEWS_API_KEY=your_news_api_key
   YOUTUBE_API_KEY=your_youtube_api_key
   PERPLEXITY_API_KEY=your_perplexity_api_key  # Optional
   PERPLEXITY_MCP_URL=https://api.perplexity.ai/mcp  # Optional
   
   # Client (.env)
   VITE_API_URL=http://localhost:5050
   ```

3. **Run Development Servers**
   ```bash
   # Terminal 1: Backend (Port 5050)
   cd server
   npm run dev
   
   # Terminal 2: Frontend (Port 5173)  
   cd client
   npm run dev
   ```

## 🏗️ Architecture

### Backend (`server/`)
- **Express.js** with TypeScript
- **Routes**: `/api/news`, `/api/youtube`, `/api/reddit`
- **MCP Integration**: AI-powered content summarization (optional)
- **Fallback Summarizer**: Local keyword extraction when MCP unavailable

### Frontend (`client/`)
- **React 19** + **Vite** + **Tailwind CSS**
- **Real-time Search**: Category buttons + text search
- **Dark Mode**: Toggle support
- **Responsive Grid**: News, YouTube videos, Reddit posts
- **Intersection Observer**: Infinite scroll ready

### Key Features
- 📰 **News**: Latest articles with AI summaries
- 🎥 **YouTube**: Trending videos with smart embedding
- 🧵 **Reddit**: Popular discussions and threads
- 🌙 **Dark Mode**: Built-in theme switching
- 🔍 **Search**: Cross-platform content discovery

## 🚀 Deployment (Vercel)

### Option 1: Monorepo Deployment
```bash
# 1. Set environment variables in Vercel dashboard:
NEWS_API_KEY=your_key
YOUTUBE_API_KEY=your_key
PERPLEXITY_API_KEY=your_key  # Optional
VITE_API_URL=https://your-app.vercel.app

# 2. Deploy
vercel --prod
```

### Option 2: Separate Deployments
```bash
# Deploy client only
cd client
vercel --prod

# Deploy server to Railway/Render/etc
cd server  
# Follow your platform's Node.js deployment guide
```

## 🔧 Troubleshooting

### Common Issues
1. **404 on Vercel**: Ensure `vercel.json` is in root, check build outputs
2. **Black YouTube videos**: Embedding restrictions, fallback to thumbnail links
3. **API errors**: Check environment variables and API quotas
4. **MCP failures**: App falls back to local summarization automatically

### Build Commands
```bash
# Client build
cd client && npm run build

# Server build  
cd server && npm run build

# Type checking
cd server && npx tsc --noEmit
```

## 📁 Project Structure
```
trends/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components  
│   │   └── App.tsx      # Main app
│   ├── package.json
│   └── vite.config.js
├── server/          # Express backend
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── utils/       # MCP integration
│   │   └── index.ts     # Server entry
│   ├── package.json
│   └── tsconfig.json
├── vercel.json      # Deployment config
└── README.md
```

## 🔑 API Keys Setup
- **News API**: [newsapi.org](https://newsapi.org)
- **YouTube Data API**: [Google Cloud Console](https://console.cloud.google.com)
- **Perplexity API**: [perplexity.ai](https://perplexity.ai) (optional)

## 📝 License
MIT License - feel free to use this project as a starting point!
