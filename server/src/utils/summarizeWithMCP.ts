import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";



export async function summarizeWithMCP(articles: any[]) {
  try {
    const mcpUrl = process.env.PERPLEXITY_MCP_URL;

    if (!mcpUrl) {
      // Fallback: simple local summary when MCP URL is not configured
      return simpleLocalSummary(articles);
    }
    const client = new Client({
      name: "pulseboard-mcp",
      version: "1.0.0",
      capabilities: {},
    });

    const transport = new SSEClientTransport(new URL(mcpUrl));

    await client.connect(transport);

    const text = articles
      .slice(0, 5)
      .map((a) => `• ${a.title} — ${a.description || ""}`)
      .join("\n");

    const result = await client.complete({
      model: "perplexity-large",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Summarize the following news headlines briefly and categorize them into 2–3 tags:\n${text}`,
            },
          ],
        },
      ],
    });

    await client.close();
    return result;
  } catch (error: any) {
    console.error("❌ MCP summarization error:", error.message || error);
    // Fallback to local summary on MCP error
    return simpleLocalSummary(articles);
  }
}

function simpleLocalSummary(articles: any[]) {
  const top = articles.slice(0, 5);
  const titles = top.map((a: any) => a.title || "");
  const descriptions = top.map((a: any) => a.description || "");
  const combined = [...titles, ...descriptions].join(" ").toLowerCase();

  const stop = new Set([
    "the","a","an","and","or","to","of","in","on","for","with","by","at","from","is","are","be","as","that","this","it","its","was","were","has","have","had","but","not","into","after","over"
  ]);

  const freq: Record<string, number> = {};
  for (const token of combined.split(/[^a-z0-9]+/g)) {
    if (!token || token.length < 3 || stop.has(token)) continue;
    freq[token] = (freq[token] || 0) + 1;
  }
  const tags = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([w]) => w);

  const summary = titles
    .map((t: string) => (t.endsWith(".") ? t : t + "."))
    .join(" ");

  return { summary, tags };
}
