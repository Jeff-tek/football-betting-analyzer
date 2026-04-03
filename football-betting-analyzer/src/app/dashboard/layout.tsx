import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user && !loading) {
      // In a real app, you'd use useRouter() or navigate()
      // For now, we'll show a message
      console.log("Redirecting to auth page");
    }
  }, [user, loading]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Please sign in to access the dashboard</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}