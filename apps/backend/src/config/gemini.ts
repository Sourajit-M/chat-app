import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "./env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export const geminiModel = genAI.getGenerativeModel({
  model: env.GEMINI_MODEL,
  generationConfig: {
    maxOutputTokens: 500,
    temperature: 0.4,
  },
});
