import { useState } from "react";
import { parseAnalysis } from "@/lib/parseAnalysis";

export function AnalysisOutput({ analysisText }: { analysisText: string }) {
  const parsed = parseAnalysis(analysisText);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(analysisText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  // Determine signal tier color
  const getSignalColor = (tier: string | null) => {
    switch (tier?.toUpperCase()) {
      case "VERY STRONG":
        return "bg-green-800";
      case "STRONG":
        return "bg-green-600";
      case "MODERATE":
        return "bg-amber-500";
      case "WEAK":
        return "bg-red-500";
      default:
        return "bg-gray-600";
    }
  };

  // Determine verdict color
  const getVerdictColor = (verdict: string | null) => {
    switch (verdict?.toUpperCase()) {
      case "BET":
        return "bg-green-800";
      case "NO BET":
        return "bg-red-800";
      case "MONITOR":
        return "bg-amber-800";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-gray-800 p-4 rounded-md">
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p className="font-medium text-gray-300">VERDICT:</p>
            <p className={`font-bold text-white ${getVerdictColor(parsed.verdict)} p-1 rounded`}>
              {parsed.verdict || "N/A"}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-300">CONFIDENCE:</p>
            <p className="font-bold text-white p-1 rounded bg-gray-700">{parsed.confidence || "N/A"}</p>
          </div>
          <div>
            <p className="font-medium text-gray-300">Z-Composite:</p>
            <p className="font-bold text-white p-1 rounded bg-gray-700 text-right">
              {parsed.zComposite ? `Home ${parsed.zComposite.split("|")[0].trim()} | Away ${parsed.zComposite.split("|")[1].trim()}` : "N/A"}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-300">Signal Tier:</p>
            <p className={`font-bold text-white p-1 rounded ${getSignalColor(parsed.signalTier)}`}>
              {parsed.signalTier || "N/A"}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-300">Primary Bet:</p>
            <p className="font-bold text-white p-1 rounded bg-gray-700">{parsed.primaryBet || "N/A"}</p>
          </div>
          <div>
            <p className="font-medium text-gray-300">EV:</p>
            <p className="font-bold text-white p-1 rounded bg-gray-700">{parsed.ev || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Raw Analysis Output */}
      <div className="bg-gray-900 p-4 rounded-md">
        <h2 className="font-semibold mb-3 text-green-400">Full Analysis Report</h2>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-gray-500">Monospace output - matches AI template exactly</span>
          <button
            onClick={handleCopy}
            className={`px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 ${isCopied ? "bg-green-600" : ""}`}
          >
            {isCopied ? "Copied!" : "Copy Full Report"}
          </button>
        </div>
        <pre className="text-xs font-mono bg-gray-800 p-3 overflow-auto rounded text-green-300">
{analysisText}
        </pre>
      </div>
    </div>
  );
}