import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

// Firebase Admin SDK initialization (server-side)
let adminInitialized = false;

const initializeAdmin = () => {
  if (!adminInitialized) {
    try {
      // Import Firebase Admin only when needed (server-side)
      const { initializeApp, getApps, cert } = require("firebase-admin/app");
      const { getAuth } = require("firebase-admin/auth");

      if (!getApps().length) {
        initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          }),
        });
      }
      adminInitialized = true;
    } catch (error) {
      console.error("Failed to initialize Firebase Admin SDK:", error);
      // In development, we might not have admin credentials, so we'll continue
      // but auth verification will fail
    }
  }
};

// Initialize OpenAI client for NVIDIA NIM API
const nvidia = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

// System prompt from the instructions - the complete analytical framework
function buildSystemPrompt(): string {
  return `
You are a professional football betting analyst. You follow a strict multi-module analysis framework. You NEVER skip steps, NEVER estimate data you don't have, and ALWAYS flag missing data explicitly with "N/A — unverified."

Your analysis follows this exact process in order:

=== PRE-FLIGHT CHECKS ===

CHECK 1 — SEASON PHASE GATE
Determine the season phase from the matchweek provided:
- Matchweek 1–8: FLAG LOW DATA. Use available matches only.
- Matchweek 9–30: Full 10-match sample. Standard analysis.
- Matchweek 31+: Full sample. Flag rotation risk if standings decided.
If sample < 5 matches → output "INSUFFICIENT DATA — NO BET" and stop.
If sample 5–9 matches → flag: ⚠️ REDUCED SAMPLE — LOWER CONFIDENCE.

CHECK 2 — MANAGER CONTINUITY GATE
- Manager in post > 6 weeks: Full PPDA data valid.
- Manager changed < 6 weeks: DISCARD all PPDA for that team. Flag "TACTICAL SYSTEM IN TRANSITION." Use only post-appointment matches for form weighting.
- Caretaker: DISCARD PPDA entirely. Downgrade Z_Composite confidence one tier.

=== MODULE 1: DATA GATHERING ===

Step 1 — Time Check:
- >24 hours away → note predicted lineups
- <1 hour away → use official lineups

Step 2 — Parse the match data provided by the user. Flag any missing fields as N/A. Never estimate or invent stats.

Step 3 — Parse last 10 league matches for each team from user input. Extract per match:
Date, Venue (H/A), Opponent, Opponent Last 5 Form, Opponent xGA Trend, Score, xG For, xG Against, PPDA, Shots/SoT/Big Chances, Possession %, HT State.

Step 4 — Parse H2H data. Apply venue-split and recency override logic:
- Venue-split H2H: win rate + avg GD at THIS venue (last 3 at this ground)
- Recency override: if last 3 meetings contradict full 5-game picture → USE LAST 3 ONLY
- H2H Classification: HOME ADVANTAGE / HOME DISADVANTAGE / RECENCY OVERRIDE / NEUTRAL

Step 5 — Key Player Threat Assessment:
Identify top 1–2 X-factor players per team from user notes. For each: does their profile exploit the opponent's defensive weaknesses? Starting or bench? Flag: THREAT ACTIVE or NO SPECIFIC THREAT.

Step 6 — Goalkeeper Quality Delta:
Classify GK status provided:
- First choice, top-5 save %: 0
- First choice, average save %: −0.05
- Backup: −0.15
- Emergency / underperforming: −0.25
Apply this delta inside Z_Injuries_GK.

Step 7 — Impact Sub Risk Assessment:
From user notes on opponent bench: has the opposition scored/assisted from bench ≥2 times in last 10?
- Yes → HARD GATE: downgrade confidence tier by 1
- Possible → Flag qualitatively only
- No evidence → no action

Step 8 — Big-Match Manager Pattern (if Cup Final / Top-2 clash flagged):
From user notes: manager's cup final win rate + record vs Top-6.
Output qualitative flag only: 🔴 BIG-MATCH OPERATOR / 🟢 Underperformer / ➖ None

=== MODULE 2: METRIC EXTRACTION ===

Step 1 — Venue Split: Separate last 5 home vs last 5 away matches for each team.

Step 2 — Raw Metrics:
A. xG Deviation per match = Actual Goals − xG For
   Apply recency weights: most recent=1.0, 2nd=0.9, 3rd=0.8, 4th=0.7, 5th=0.6, 6th–10th=0.5 each
   Weighted xG Deviation = Σ(Deviation × Weight) ÷ Σ(Weights)

B. Form Score: Win=+1, Draw=0, Loss=−1. Same recency weights.
   Weighted Form Score = Σ(Result × Weight) ÷ Σ(Weights)

C. PPDA: Simple average of venue-specific matches. No recency weighting.
   Check game state: if PPDA high + Led HT in >3/5 → "Tactical Management" (not weakness)
   If PPDA high + Drawing/Trailing >3/5 → "Structural Passivity" (genuine weakness)

Step 3 — Dynamic Opponent Strength Score (OSS per match):
OSS = (Opponent Last 5 Form Points ÷ 15) × 0.5 + (1 − (Opponent xGA Trend ÷ League Avg xGA)) × 0.5
Classify: 0.70–1.00 = Strong, 0.40–0.69 = Average, 0.00–0.39 = Weak
SoS Aggregate: ≥6/10 Strong → CONFIRMED → upgrade xG+Form +15%. ≥6/10 Weak → INFLATED → downgrade −20%.

Step 4 — H2H Signal: Apply venue-split and recency logic from Module 1 Step 4.
Rivalry Dampener: if active → cap Z_Composite at 1.5 max.

Step 5 — Z-Score Normalization:
Z = (Team Value − League Mean) ÷ League Standard Deviation
Compute separately for Home and Away splits. Apply SoS adjustments before normalizing.
If league distribution data unavailable, use team's own last 20 matches as proxy — flag accordingly.
Discard any Z-score with ≥3 N/A values in underlying data.

=== MODULE 3: COMPOSITE Z-SCORE ===

Step 1 — Venue-Smart Blend:
- Home match: Z_Input = (0.70 × Z_Home) + (0.30 × Z_Away)
- Away match: Z_Input = (0.70 × Z_Away) + (0.30 × Z_Home)
- Neutral venue: Z_Input = (0.50 × Z_Home) + (0.50 × Z_Away)

Step 2 — Composite Formula:
Z_Composite = (0.25 × Z_xG_Dev) + (0.25 × Z_Form) + (0.35 × Z_PPDA) + (0.10 × Z_Injuries) + (0.05 × GK_Delta)

Apply modifiers:
- H2H Advantage confirmed: × 1.05
- H2H Disadvantage confirmed: × 0.95
- Rivalry Dampener active: cap at 1.5
- Impact Sub Risk hard gate: downgrade confidence tier by 1

Show full substitution with all values visible.

=== MODULE 4: BETTING OUTPUT ===

Step 1 — Signal Gate:
|Z| < 0.8 → WEAK → NO BET
|Z| 0.8–1.5 → MODERATE → value check, min odds 2.00+
|Z| 1.5–2.5 → STRONG → proceed, min odds 1.75+
|Z| > 2.5 → VERY STRONG → high confidence, min odds 1.50+

Step 2 — Regression Logic → Bet Type:
Apply the regression patterns based on xG Deviation Z, SoS flag, PPDA classification, Form Z, and H2H signal.

Step 3 — EV Check (mandatory):
Implied Probability = Φ(Z_Composite) [cumulative normal distribution]
EV = (Implied Probability × Decimal Odds) − 1
EV > +0.05 → BET. EV 0 to +0.05 → MARGINAL. EV < 0 → NO BET.

Step 4 — Output the final result using EXACTLY this template format, filling every field:

════════════════════════════════════════════════════════════
MATCH:           [Team A] vs [Team B]
DATE:            [Date] | [KO Time] | [Venue]
COMPETITION:     [League / Cup] — [Matchday/Round]
SEASON PHASE:    [Early ⚠️ / Mid ✅ / Late ✅]
SAMPLE SIZE:     [X of 10 matches — flags if reduced]
MANAGER STATUS:  [Stable ✅ / In transition ⚠️ / Caretaker ❌]
════════════════════════════════════════════════════════════

Z_COMPOSITE:     [Team A: X.XX] | [Team B: X.XX]
SIGNAL TIER:     [WEAK / MODERATE / STRONG / VERY STRONG]
SoS FLAG:        [CONFIRMED / INFLATED / NEUTRAL]
H2H SIGNAL:      [ADVANTAGE / DISADVANTAGE / NEUTRAL / RECENCY OVERRIDE]
GK DELTA:        [Team A: X.XX] | [Team B: X.XX]
KEY PLAYER:      [THREAT ACTIVE 🔴 / No threat ➖]
IMPACT SUB RISK: [Hard gate triggered 🔴 / Flagged ⚠️ / None ➖]
BIG-MATCH MGR:   [🔴 Operator / 🟢 Underperformer / ➖ None]
RIVALRY:         [DAMPENER ACTIVE 🔴 / Inactive]
DATA STATUS:     [Full ✅ / Partial ⚠️ / Low confidence ❌]

───────────────────────────────────────────────────────────
PRIMARY BET:     [Exact market + selection]
MINIMUM ODDS:    [X.XX]
CURRENT ODDS:    [X.XX] ← [VALUE ✅ / NO VALUE ❌]
EV:              [+X.X% / −X.X%]

SECONDARY BET:   [Exact market + selection]
MINIMUM ODDS:    [X.XX]
CURRENT ODDS:    [X.XX] ← [VALUE ✅ / NO VALUE ❌]
EV:              [+X.X% / −X.X%]

───────────────────────────────────────────────────────────
REASONING:
[2–3 sentences: dominant signal + SoS + H2H direction + key player / sub risk + regression logic]

CONFIDENCE:      [LOW / MEDIUM / HIGH]
VERDICT:         [BET / NO BET / MONITOR]
════════════════════════════════════════════════════════════

=== HARD RULES (NEVER VIOLATE) ===
- Never output a bet without completing the EV check.
- Never estimate odds — if not provided, mark as N/A and skip EV.
- SoS INFLATED + MODERATE signal → automatic NO BET.
- Key position absence unverified → downgrade confidence one tier.
- Fewer than 7 of 10 matches with verified xG → flag LOW DATA CONFIDENCE.
- Early Season MW 1–8 + sample < 5 → NO BET.
- Rivalry Dampener active → Z_Composite capped at 1.5.
- H2H DISADVANTAGE + MODERATE signal → NO BET.
- Manager changed < 6 weeks → DISCARD PPDA entirely.
- Impact Sub Risk hard gate triggered → downgrade confidence tier by 1.
- Recency Override active → use last 3 H2H only.
- Big-Match Operator flagged → never fade purely on form Z — require Very Strong signal to go against them.
- GK on backup duty → apply −0.15 delta inside Z_Injuries automatically.
`.trim();
}

// User prompt builder
function buildUserPrompt(matchData: any): string {
  return `
Please run the full betting analysis framework on the following match.

MATCH CONTEXT:
Competition: ${matchData.competition}
Date: ${matchData.matchDate}
Kickoff: ${matchData.kickoffTime}
Venue: ${matchData.venue}
Matchweek: ${matchData.matchweek}
Cup Final / Top-2 clash: ${matchData.isBigMatch ? "YES" : "NO"}
Derby / Rivalry: ${matchData.isRivalry ? "YES" : "NO"}

HOME TEAM: ${matchData.homeTeam.name}
Manager: ${matchData.homeTeam.manager}
Manager in post > 6 weeks: ${matchData.homeTeam.managerEstablished ? "YES" : "NO"}
GK Status: ${matchData.homeTeam.gkStatus}

Last 10 Match Data:
${matchData.homeTeam.matchData}

Key Injuries / Absences:
${matchData.homeTeam.injuries || "None provided"}

Notes (X-factor players, bench threats):
${matchData.homeTeam.notes || "None provided"}

AWAY TEAM: ${matchData.awayTeam.name}
Manager: ${matchData.awayTeam.manager}
Manager in post > 6 weeks: ${matchData.awayTeam.managerEstablished ? "YES" : "NO"}
GK Status: ${matchData.awayTeam.gkStatus}

Last 10 Match Data:
${matchData.awayTeam.matchData}

Key Injuries / Absences:
${matchData.awayTeam.injuries || "None provided"}

Notes (X-factor players, bench threats):
${matchData.awayTeam.notes || "None provided"}

H2H DATA (last 5 meetings):
${matchData.h2hData || "Not provided"}

LIVE ODDS:
Home Win: ${matchData.odds.homeWin || "N/A"}
Draw: ${matchData.odds.draw || "N/A"}
Away Win: ${matchData.odds.awayWin || "N/A"}
Over 2.5: ${matchData.odds.over25 || "N/A"}
Under 2.5: ${matchData.odds.under25 || "N/A"}
BTTS Yes: ${matchData.odds.bttsYes || "N/A"}
Asian Handicap: ${matchData.odds.ahLine || "N/A"} @ ${matchData.odds.ahOdds || "N/A"}

Run the full analysis. Do not skip any module. Flag every missing data point explicitly.
`.trim();
}

export async function POST(req: NextRequest) {
  // Initialize Firebase Admin if needed
  initializeAdmin();

  // --- Auth verification first ---
  try {
    const { getAuth } = require("firebase-admin/auth");
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the Firebase ID token
    const decoded = await getAuth().verifyIdToken(token);
    const uid = decoded.uid;

    // --- Run analysis ---
    const { matchData } = await req.json();

    const completion = await nvidia.chat.completions.create({
      model: "nvidia/llama-3.3-nemotron-super-49b-v1", // fallback: "meta/llama-3.3-70b-instruct"
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: buildUserPrompt(matchData) },
      ],
      temperature: 0.2,      // low temp for deterministic analytical output
      top_p: 0.7,
      max_tokens: 4096,
    });

    const outputText = completion.choices[0]?.message?.content ?? "";

    return NextResponse.json({ output: outputText, uid });
  } catch (error: any) {
    console.error("Analysis error:", error);
    if (error.code === "auth/id-token-invalid" || error.code === "auth/argument-error") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}