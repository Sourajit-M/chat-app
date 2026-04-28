import { useState } from "react";
import { useSummarize } from "../../hooks/useSummarise";
import {
  X, Sparkles, Loader2, RefreshCw,
  MessageSquare, Calendar, Hash
} from "lucide-react";

interface Props {
  conversationId: string;
  conversationName: string;
  onClose: () => void;
}

const MESSAGE_LIMIT_OPTIONS = [20, 50, 100];

const SummaryModal = ({ conversationId, conversationName, onClose }: Props) => {
  const { summarize, isLoading, result, error, reset } = useSummarize();
  const [limit, setLimit] = useState(50);

  const handleSummarize = () => {
    summarize(conversationId, limit);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Parse sections from Gemini response for nicer rendering
  const renderSummary = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      // Bold headings like "Overview:" or "**Overview:**"
      const isHeading =
        line.match(/^(Overview|Key Points|Mood|Action Items):/i) ||
        line.match(/^\*\*(.*?)\*\*:/);

      if (isHeading) {
        const cleaned = line.replace(/\*\*/g, "");
        return (
          <p key={i} className="font-semibold text-primary mt-3 mb-1 text-sm">
            {cleaned}
          </p>
        );
      }

      if (line.startsWith("- ") || line.startsWith("• ")) {
        return (
          <p key={i} className="text-sm text-base-content/80 pl-3 leading-relaxed">
            {line}
          </p>
        );
      }

      if (line.trim() === "") return <br key={i} />;

      return (
        <p key={i} className="text-sm text-base-content/80 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="p-5 border-b border-base-300 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">AI Summary</h2>
              <p className="text-xs text-base-content/50 truncate max-w-48">
                {conversationName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Controls */}
          {!result && !isLoading && (
            <div className="space-y-4">
              <p className="text-sm text-base-content/70">
                Generate an AI-powered summary of this conversation to quickly
                catch up on what was discussed.
              </p>

              {/* Message count selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wide">
                  Summarize last
                </label>
                <div className="flex gap-2">
                  {MESSAGE_LIMIT_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setLimit(opt)}
                      className={`btn btn-sm flex-1 gap-1 ${
                        limit === opt ? "btn-primary" : "btn-ghost border border-base-300"
                      }`}
                    >
                      <Hash className="w-3 h-3" />
                      {opt} messages
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSummarize}
                className="btn btn-primary w-full gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Summary
              </button>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <Loader2 className="w-14 h-14 animate-spin text-primary absolute inset-0" />
              </div>
              <div className="text-center">
                <p className="font-medium text-sm">Analyzing conversation...</p>
                <p className="text-xs text-base-content/50 mt-1">
                  Gemini is reading the last {limit} messages
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="space-y-3">
              <div className="alert alert-error text-sm">
                <X className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={reset}
                className="btn btn-ghost btn-sm w-full gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-4">

              {/* Meta info */}
              <div className="flex items-center gap-4 p-3 bg-base-200 rounded-xl text-xs text-base-content/60">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{result.messageCount} messages</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {formatDate(result.from)} → {formatDate(result.to)}
                  </span>
                </div>
              </div>

              {/* Summary Text */}
              <div className="bg-base-200 rounded-xl p-4 space-y-1">
                {renderSummary(result.summary)}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={reset}
                  className="btn btn-ghost btn-sm flex-1 gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  New Summary
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result.summary);
                  }}
                  className="btn btn-ghost btn-sm flex-1 gap-2"
                >
                  Copy
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default SummaryModal;