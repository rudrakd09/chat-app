import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const testAI = async () => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const res = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a professional local real-time chat translator. Translate the following text natively into perfectly natural-sounding English. Do not add quotes, specific metadata, or explanations—return strictly and beautifully only the flawlessly translated text itself.\n\nText: shreyash is gay`
        });
        console.log("SUCCESS:", res.text);
    } catch(e) {
        console.error("FAIL:", e);
    }
}
testAI();
