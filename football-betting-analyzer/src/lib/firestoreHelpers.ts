import { db } from "./firebase";
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from "firebase/firestore";

export interface AnalysisRecord {
  createdAt: FirebaseFirestore.Timestamp;
  matchLabel: string;
  competition: string;
  matchDate: string;
  kickoffTime: string;
  venue: string;
  rawInput: string;
  rawOutput: string;
  verdict: "BET" | "NO BET" | "MONITOR";
  confidence: "LOW" | "MEDIUM" | "HIGH";
  signalTier: "WEAK" | "MODERATE" | "STRONG" | "VERY STRONG";
  zCompositeHome: number;
  zCompositeAway: number;
  primaryBet: string;
  secondaryBet: string;
}

// Save analysis result
export async function saveAnalysis(uid: string, data: AnalysisRecord) {
  const ref = collection(db, "users", uid, "analyses");
  return addDoc(ref, { ...data, createdAt: serverTimestamp() });
}

// Fetch recent analyses (last 20)
export async function fetchHistory(uid: string) {
  const ref = collection(db, "users", uid, "analyses");
  const q = query(ref, orderBy("createdAt", "desc"), limit(20));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}