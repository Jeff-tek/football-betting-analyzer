import { useState } from "react";
import { useHistory } from "@/hooks/useHistory";
import { AnalysisOutput } from "@/components/AnalysisOutput";

export function HistoryPanel() {
  const { history, loading, error } = useHistory();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return <div className="text-center py-12">Loading history...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">Error loading history: {error}</div>;
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No analyses yet. Run your first analysis to see it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center">Analysis History</h2>
      <div className="space-y-3">
        {history.map((analysis: any) => (
          <div key={analysis.id} className="border border-gray-700 rounded-md overflow-hidden">
            <div
              onClick={() => setExpandedId(expandedId === analysis.id ? null : analysis.id)}
              className="cursor-pointer p-4 bg-gray-800 flex justify-between items-center"
            >
              <div className="space-y-2">
                <p className="font-medium text-white">{analysis.matchLabel || "Unknown Match"}</p>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-400">
                    {new Date(analysis.createdAt.seconds * 1000).toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    analysis.verdict === "BET"
                      ? "bg-green-800"
                      : analysis.verdict === "NO BET"
                      ? "bg-red-800"
                      : "bg-amber-800"
                  }`}>
                  {analysis.verdict}
                  </span>
                  <span className="text-gray-400">{analysis.confidence || ""}</span>
                </div>
              </div>
            </div>
            <div className={expandedId === analysis.id ? "border-t border-gray-700" : "hidden"}>
              <AnalysisOutput analysisText={analysis.rawOutput} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}