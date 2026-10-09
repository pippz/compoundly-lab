// Vercel serverless function: POST /api/translate
// Configure DEEPL_API_KEY in Vercel Project Settings > Environment Variables.
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.DEEPL_API_KEY) {
    return res.status(503).json({ error: "Translation is not configured on the server" });
  }

  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!text || text.length > 200) {
    return res.status(400).json({ error: "Provide a search term of 1–200 characters" });
  }

  // Guard against using the translation endpoint for identifiers or formula strings.
  if (/^\d+(?:[.,]\d+)?$/.test(text) || /^\d{2,7}-\d{2}-\d$/.test(text) ||
      /^InChI=/i.test(text) || /^[A-Z]{14}-[A-Z]{10}-[A-Z]$/i.test(text) ||
      /^(?:[A-Z][a-z]?\d*)+$/.test(text) || /[\[\]{}()=#/@\\]/.test(text) ||
      /\b(?:SMILES|InChIKey|InChI)\b/i.test(text)) {
    return res.status(400).json({ error: "Chemical identifiers and notation are not translated" });
  }

  const baseUrl = process.env.DEEPL_API_KEY.includes(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  try {
    const form = new URLSearchParams({
      auth_key: process.env.DEEPL_API_KEY,
      text,
      source_lang: "IT",
      target_lang: "EN-US"
    });
    const upstream = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString()
    });

    if (!upstream.ok) {
      const body = await upstream.text().catch(() => "");
      console.error("DeepL request failed", upstream.status, body.slice(0, 300));
      return res.status(502).json({ error: "Translation provider request failed" });
    }

    const data = await upstream.json();
    const translatedText = data?.translations?.[0]?.text;
    if (typeof translatedText !== "string" || !translatedText.trim()) {
      return res.status(502).json({ error: "Translation provider returned no translation" });
    }

    return res.status(200).json({ translatedText: translatedText.trim() });
  } catch (error) {
    console.error("DeepL request error", error);
    return res.status(502).json({ error: "Translation provider is temporarily unavailable" });
  }
};
