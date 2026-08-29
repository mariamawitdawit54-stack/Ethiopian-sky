const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is missing from .env");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey
});

const systemInstruction = `
You are Sky AI, the astronomy assistant for the Ethiopian Sky website.

Your role:
- Answer normal astronomy and space-science questions naturally.
- Explain planets, stars, galaxies, telescopes, observing, and related science.
- Explain Ethiopian astronomical heritage and modern Ethiopian space science.
- Answer in English or Amharic according to the user's language.

Evidence rules:
- Distinguish established scientific facts from historical interpretation.
- Distinguish documented Ethiopian traditions from legends or unsupported claims.
- Never present an uncertain historical claim as proven fact.
- Do not claim Ethiopia independently invented astronomy unless reliable evidence establishes that conclusion.

Documented traditional planetary names used by this project:
Mercury — አጣርድ
Venus — ዝሁራ
Mars — መሪህ
Jupiter — መሽተሪ
Saturn — ዙሐል

Do not invent traditional names for Uranus or Neptune.

For Ethiopian astronomy questions, use an evidence-first tone and explain uncertainty where appropriate.
`;

app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = String(req.body.message || "").trim();

    if (!userMessage) {
      return res.status(400).json({
        error: "Please enter a question."
      });
    }

    const interaction = await ai.interactions.create({
      model: "gemini-3.6-flash",
      input: userMessage,
      system_instruction: systemInstruction
    });

    res.json({
      reply: interaction.output_text
    });

  } catch (error) {
    console.error("Gemini error:", error);

    res.status(500).json({
      error: "Sky AI could not generate a response right now."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Sky AI server running at http://localhost:${PORT}`);
});