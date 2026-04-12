const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const anthropicKey = defineSecret("ANTHROPIC_API_KEY");

exports.proxy = onRequest(
  { secrets: [anthropicKey], cors: true },
  async (req, res) => {
    // CORS preflight
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(204).send("");

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const { type, query } = req.body;
      if (!type || !query) {
        return res.status(400).json({ error: "Missing type or query" });
      }

      const systemPrompt = `Tu es un assistant OSINT éducatif. Réponds UNIQUEMENT en JSON valide (sans markdown, sans backticks).
Format strict :
{
  "cible": "valeur analysée",
  "type": "type de recherche",
  "risque": "FAIBLE|MODÉRÉ|ÉLEVÉ",
  "resume": "une phrase résumant ce qu'on peut trouver sur ce type de cible",
  "sources_osint": ["liste de 4-6 vraies sources OSINT gratuites pertinentes"],
  "techniques": ["2-4 techniques OSINT éducatives applicables"],
  "infos_potentielles": {"clé1": "valeur exemple illustrative", "clé2": "..."},
  "conseils_protection": ["2-3 conseils pour se protéger"],
  "avertissement": "rappel éducatif court"
}
Reste factuel et éducatif. Ne fournis jamais d'informations réelles sur des personnes privées.`;

      const userPrompt = `Analyse OSINT éducative sur le type "${type}" : "${query}". Explique quelles informations peuvent être trouvées légalement sur ce type de cible et comment s'en protéger.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey.value(),
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      const data = await response.json();
      const text = data.content?.map((i) => i.text || "").join("") || "";

      let parsed;
      try {
        parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      } catch {
        return res.status(500).json({ error: "Invalid AI response", raw: text });
      }

      return res.status(200).json(parsed);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);
