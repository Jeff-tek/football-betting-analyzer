# Football Betting Analysis Platform

A comprehensive football match betting analysis platform built with Next.js 14, Firebase, and NVIDIA NIM API. This platform allows users to run structured football match betting analyses using a professional AI agent framework.

## Features

- **Firebase Authentication**: Email/password and Google OAuth login
- **AI-Powered Analysis**: Uses NVIDIA NIM API (llama-3.3-nemotron-super-49b-v1) for professional football betting analysis
- **Firestore Database**: Stores user analysis history with secure per-user data isolation
- **Professional Analytical Framework**: Implements a strict multi-module analysis system including:
  - Pre-flight checks (season phase, manager continuity)
  - Data gathering and parsing
  - Metric extraction (xG deviation, form score, PPDA, opponent strength)
  - Composite Z-score calculation
  - Betting output with EV checking
- **Responsive Design**: Works on mobile and desktop devices
- **Dark Intelligence Dashboard**: Professional dark theme with electric green accents
- **History Panel**: View and revisit past analyses
- **Copy to Clipboard**: Easily copy full analysis reports

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth (Email/Password + Google OAuth)
- **Database**: Firebase Firestore
- **AI**: NVIDIA NIM API via OpenAI-compatible interface
- **State Management**: React hooks

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NVIDIA_API_KEY=          # server-side only, no NEXT_PUBLIC prefix

# For Firebase Admin SDK (server-side only)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

## Getting Started

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up Firebase project**:
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password and Google)
   - Enable Firestore Database
   - Add your web app to get the config values
4. **Set up NVIDIA API key**:
   - Get an API key from [NVIDIA NIM](https://build.nvidia.com/nim)
5. **Create `.env.local`** with the variables above
6. **Run the development server**:
   ```bash
   npm run dev
   ```
7. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Project Structure

```
/src
  /app
    /auth              # Authentication page
    /dashboard         # Main dashboard with sidebar layout
    /api/analyze       # API route for AI analysis
  /components
    MatchInputForm.tsx # Detailed match input form
    AnalysisOutput.tsx # Displays analysis results
    HistoryPanel.tsx   # Shows user's analysis history
    Sidebar.tsx        # Navigation sidebar
  /hooks
    useAuth.ts         # Firebase authentication hook
    useHistory.ts      # Firestore history hook
  /lib
    firebase.ts        # Firebase configuration
    firestoreHelpers.ts # Firestore CRUD operations
    parseAnalysis.ts   # Parses AI output into structured data
```

## How It Works

1. User signs in with email/password or Google OAuth
2. User fills out the detailed match input form with:
   - Match context (competition, date, venue, etc.)
   - Home/away team data (managers, GK status, last 10 matches)
   - H2H data and live odds
3. User clicks "RUN ANALYSIS"
4. Frontend sends data to `/api/analyze` route with Firebase ID token
5. API route verifies token with Firebase Admin SDK
6. API route calls NVIDIA NIM API with the full analytical framework prompt
7. AI returns structured analysis following the strict multi-module framework
8. Frontend displays summary card and full raw output
9. Result is automatically saved to Firestore under user's document
10. User can access analysis history from the History tab

## Analysis Framework

The AI follows a strict 4-module process:

### Module 1: Pre-flight Checks
- Season phase gate (early/mid/late season adjustments)
- Manager continuity gate (tactical system transitions)

### Module 2: Data Gathering & Metric Extraction
- Time-based lineup predictions
- Last 10 match data parsing with recency weighting
- H2H analysis with venue-split and recency override
- Player threat assessment
- GK quality delta calculation
- Impact sub-risk assessment
- Big-match manager patterns
- Venue-split metrics (xG deviation, form score, PPDA)
- Dynamic opponent strength scoring
- Z-score normalization

### Module 3: Composite Z-Score
- Venue-smart blending (home/away/neutral adjustments)
- Composite formula with weighted components
- Modifiers for H2H signals, rivalry dampener, impact sub-risk

### Module 4: Betting Output
- Signal gating based on Z-score thresholds
- Regression logic for bet type selection
- Mandatory EV (Expected Value) checking
- Formatted output template with all required fields
- Hard rules that are never violated

## Deployment

The easiest way to deploy is using Vercel:

```bash
npm i -g vercel
vercel
```

Make sure to set the environment variables in your Vercel project settings, especially:
- Firebase configuration (NEXT_PUBLIC_* variables)
- NVIDIA_API_KEY (server-only)
- Firebase Admin credentials (server-only)

## Important Notes

- The AI only processes data provided by the user - it does not search the web
- Any missing data is explicitly flagged as "N/A — unverified"
- All bets require passing the EV (Expected Value) check
- The platform follows strict responsible gambling principles
- Designed for educational and analytical purposes

---

Built with Next.js 14 and deployed on Vercel.