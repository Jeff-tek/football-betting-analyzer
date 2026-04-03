import { useAuth } from "@/hooks/useAuth";
import { useHistory } from "@/hooks/useHistory";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function Sidebar() {
  const { user, loading: authLoading } = useAuth();
  const { history, loading: historyLoading } = useHistory();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // In a real app, you'd use useRouter() or navigate()
      // For now, we'll show a message
      console.log("Signed out, redirecting to auth page");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  if (authLoading || historyLoading) {
    return (
      <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 flex flex-col">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            🏈
          </div>
          <div className="space-y-1">
            <p className="font-medium text-white">Football Analyzer</p>
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            🏈
          </div>
          <div className="space-y-1">
            <p className="font-medium text-white">Football Analyzer</p>
            <p className="text-sm text-gray-400">Please sign in</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 flex flex-col h-full">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
          🏈
        </div>
        <div className="space-y-1">
          <p className="font-medium text-white">{user.email?.split("@")[0] || "User"}</p>
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={handleSignOut}
          className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2 px-4 rounded transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mb-4">
          <p className="font-medium text-gray-300 mb-2">Recent Analyses</p>
          {history.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No analyses yet</p>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 5).map((analysis: any) => (
                <div
                  key={analysis.id}
                  className="p-3 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer transition-colors"
                >
                  <p className="font-medium text-white">{analysis.matchLabel || "Unknown Match"}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(analysis.createdAt.seconds * 1000).toLocaleDateString()}
                  </p>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    analysis.verdict === "BET"
                      ? "bg-green-800"
                      : analysis.verdict === "NO BET"
                      ? "bg-red-800"
                      : "bg-amber-800"
                  }`}>
                  {analysis.verdict}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}