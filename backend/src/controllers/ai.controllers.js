import { ai } from "../lib/gemini.js";

const translateMessage = async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Text to realistically translate is securely required." });
    }

    if (!ai) {
       return res.status(503).json({ message: "AI Engine module is completely missing or improperly configured natively. Ensure GEMINI_API_KEY securely exists in .env." });
    }

    const prompt = `You are a professional local real-time chat translator. Translate the following text natively into perfectly natural-sounding ${targetLanguage || "English"}. Do not add quotes, specific metadata, or explanations—return strictly and beautifully only the flawlessly translated text itself.\n\nText: ${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.status(200).json({ translation: response.text });
  } catch (error) {
    if (error.message && error.message.includes("503") && error.message.includes("high demand")) {
      return res.status(503).json({ message: "Google's AI servers are temporarily overloaded right now. Please try again in a few moments!" });
    }
    console.error("AI Native Translation Error: ", error);
    res.status(500).json({ message: "AI Translation service failed." });
  }
};

export { translateMessage };
