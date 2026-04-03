import { useState } from "react";
import { MatchInputForm } from "@/components/MatchInputForm";
import { HistoryPanel } from "@/components/HistoryPanel";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"analysis" | "history">("analysis");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 mb-4">
        <button
          onClick={() => setActiveTab("analysis")}
          className={`
            px-4 py-2 rounded-tl-lg rounded-tr-lg
            ${activeTab === "analysis" ? "bg-green-800 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}
          `}
        >
          New Analysis
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`
            px-4 py-2 rounded-tl-lg rounded-tr-lg
            ${activeTab === "history" ? "bg-green-800 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}
          `}
        >
          History
        </button>
      </div>

      {activeTab === "analysis" ? <MatchInputForm /> : <HistoryPanel />}
    </div>
  );
}