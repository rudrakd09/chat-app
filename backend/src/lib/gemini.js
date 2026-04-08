import { GoogleGenAI } from "@google/genai";
import ENV from "./env.js";

let ai = null;

if (ENV.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
    console.log("Connected securely to Google Gemini AI Engine.");
  } catch (error) {
    console.warn("Failed to initialize Gemini AI Engine:", error.message);
  }
} else {
  console.warn("GEMINI_API_KEY is securely missing from .env! AI Chat and Native Translation features officially run in fallback mode.");
}

export { ai };
