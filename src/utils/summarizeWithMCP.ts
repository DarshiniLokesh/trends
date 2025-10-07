export async function summarizeWithMCP(articles: any[]) {
    try {
      const { Client, WebSocketServerTransport } = await import("@modelcontextprotocol/sdk");
  
      const client = new Client({
        name: "pulseboard-mcp",
        version: "1.0.0",
        capabilities: {},
      });
  
      const transport = new WebSocketServerTransport({
        url: "wss://api.perplexity.ai/mcp",
        apiKey: process.env.PERPLEXITY_API_KEY,
      });
  
      await client.connect(transport);
  
      const text = articles
        .slice(0, 5)
        .map((a) => `• ${a.title} — ${a.description || ""}`)
        .join("\n");
  
      const result = await client.complete({
        model: "perplexity-large",
        prompt: `Summarize the following news headlines briefly and categorize them into 2–3 tags:\n${text}`,
      });
  
      await client.close();
      return result;
    } catch (error) {
      console.error("❌ MCP summarization error:", error);
      return { summary: "Could not summarize at this time." };
    }
  }
  