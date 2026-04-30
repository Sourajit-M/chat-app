import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "./env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

const MODEL_FALLBACK_CHAIN = [
  env.GEMINI_MODEL,       // primary (e.g. gemini-2.5-flash from env)
  "gemini-2.0-flash",     // first fallback
  "gemini-1.5-flash",     // second fallback
];

const generationConfig = {
  maxOutputTokens: 500,
  temperature: 0.4,
};

export const geminiModel = genAI.getGenerativeModel({
  model: MODEL_FALLBACK_CHAIN[0],
  generationConfig,
});

/**
 * Tries to generate content using the model fallback chain.
 * If the primary model returns a 503, it automatically retries
 * with the next available model.
 */
export async function generateWithFallback(prompt: string): Promise<string> {
  let lastError: unknown;

  for (const modelName of MODEL_FALLBACK_CHAIN) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName, generationConfig });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err: any) {
      lastError = err;
      // Only retry on 503 (overloaded) or 429 (rate limited); surface all other errors immediately
      const status = err?.status ?? err?.statusCode;
      if (status !== 503 && status !== 429) {
        throw err;
      }
      console.warn(`Gemini model "${modelName}" unavailable (${status}), trying next fallback...`);
    }
  }

  throw lastError;
}
