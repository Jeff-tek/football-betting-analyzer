import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { fetchHistory } from "../lib/firestoreHelpers";

export function useHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    const loadHistory = async () => {
      try {
        setLoading(true);
        const data = await fetchHistory(user.uid);
        setHistory(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load history");
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [user]);

  return { history, loading, error };
}