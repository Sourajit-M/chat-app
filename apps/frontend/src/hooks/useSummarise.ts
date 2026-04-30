import { useState } from "react";
import { axiosInstance } from "../lib/axios";

interface SummaryResult {
  summary: string;
  messageCount: number;
  from: string;
  to: string;
}

export const useSummarize = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const summarize = async (
    conversationId: string,
    limit: number = 50
  ) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axiosInstance.post(
        `/ai/summarize/${conversationId}?limit=${limit}`
      );
      setResult(res.data);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 503 || status === 429) {
        setError(err.response?.data?.message || "The AI service is currently overloaded. Please try again in a few moments.");
      } else if (err.request && !err.response) {
        setError("Server unreachable. Please check your connection.");
      } else {
        setError(err.response?.data?.message || "Failed to generate summary");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { summarize, isLoading, result, error, reset };
};