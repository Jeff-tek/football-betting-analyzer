import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function RootLayout() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      // In a real app, you'd use useRouter() or navigate()
      // For now, we'll show a message indicating redirect
      console.log("Redirecting to auth page");
    }
  }, [user, loading]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="text-center bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-green-400 mb-4">Football Betting Analyzer</h2>
          <p className="text-gray-400 mb-6">
            Please sign in to access the football match betting analysis platform
          </p>
          <div className="space-y-3">
            <a href="/auth" className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded transition-colors">
              Sign In to Continue
            </a>
          </div>
        </div>
      </div>
    );
  }

  // If user is logged in, show dashboard
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex min-h-screen">
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              🏈
            </div>
            <div className="space-y-1">
              <p className="font-medium text-white">Football Analyzer</p>
              <p className="text-sm text-gray-400">Dashboard</p>
            </div>
          </div>
        </div>
        <div className="flex-1 p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Welcome to Football Betting Analyzer</h1>
          <p className="text-gray-400 text-center max-w-xl mx-auto">
            Use the sidebar to navigate between creating new analyses and viewing your history.
          </p>
        </div>
      </div>
    </div>
  );
}