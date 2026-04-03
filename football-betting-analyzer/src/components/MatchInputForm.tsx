import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AnalysisOutput } from "@/components/AnalysisOutput";

export function MatchInputForm() {
  const { user } = useAuth();
  const [matchData, setMatchData] = useState({
    // Match Context
    competition: "",
    matchDate: "",
    kickoffTime: "",
    venue: "",
    matchweek: 1,
    isBigMatch: false,
    isRivalry: false,

    // Home Team
    homeTeam: {
      name: "",
      manager: "",
      managerEstablished: false,
      gkStatus: "First Choice",
      matchData: "",
      injuries: "",
      notes: "",
    },

    // Away Team
    awayTeam: {
      name: "",
      manager: "",
      managerEstablished: false,
      gkStatus: "First Choice",
      matchData: "",
      injuries: "",
      notes: "",
    },

    // H2H Data
    h2hData: "",

    // Live Odds
    odds: {
      homeWin: "",
      draw: "",
      awayWin: "",
      over25: "",
      under25: "",
      bttsYes: "",
      ahLine: "",
      ahOdds: "",
    },
  });

  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // In a real implementation, this would call the API route
      // For now, we'll simulate with a placeholder
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // In a real app, you'd get the ID token from useAuth()
          Authorization: `Bearer ${user ? "fake-token-for-demo" : ""}`,
        },
        body: JSON.stringify({ matchData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAnalysisResult(data.output);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center">Football Match Analysis</h1>

      {/* Match Context */}
      <div className="bg-gray-800 p-4 rounded-md">
        <h2 className="font-semibold mb-3">Match Context</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Competition</label>
            <input
              type="text"
              placeholder="Premier League"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 text-white"
              value={matchData.competition}
              onChange={(e) => setMatchData({ ...matchData, competition: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Match Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 text-white"
              value={matchData.matchDate}
              onChange={(e) => setMatchData({ ...matchData, matchDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Kickoff Time</label>
            <input
              type="time"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 text-white"
              value={matchData.kickoffTime}
              onChange={(e) => setMatchData({ ...matchData, kickoffTime: e.target.value })}
            />
          </div