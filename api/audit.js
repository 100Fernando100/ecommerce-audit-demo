export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { url, industry } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  const prompt = `You are a senior e-commerce CRO auditor with CPA-level financial expertise. Analyze this store: ${url} | Industry: ${industry || "general"}. Return ONLY valid JSON (no markdown, no backticks): {"store_name":"name","platform":"Shopify/WooCommerce/Other","findings":[{"id":"id","category":"trust|ux|performance|conversion|compliance","severity":"critical|high|medium|low","title":"title","description":"what is wrong","impact":"financial impact","fix":"specific fix","conversion_impact":0.05,"effort":"low|medium|high"}],"scores":{"trust":0,"ux":0,"performance":0,"conversion":0,"overall":0},"quick_wins":["top 3 actions"],"cross_border_flags":["issues if any"]}. Be thorough. At least 6-8 findings. Use web search to analyze the actual store.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4000, messages: [{ role: "user", content: prompt }], tools: [{ type: "web_search_20250305", name: "web_search" }] }),
    });
    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: "AI failed", details: data });
    let text = "";
    if (data.content) for (const b of data.content) if (b.type === "text") text += b.text;
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return res.status(200).json(JSON.parse(match[0]));
    return res.status(500).json({ error: "Parse failed" });
  } catch (err) { return res.status(500).json({ error: err.message }); }
}
