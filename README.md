# Life Partner AI

**Life Partner AI** is a next-generation matrimony platform that uses Generative AI to match users based on values, emotional compatibility, and life vision—not just biodata.

## 🚀 Key Features

-   **Prompt-Based Matching**: Users describe their ideal partner in natural language. AI extracts values and personality traits.
-   **Viral Reels**: TikTok-style video feed for users to showcase their personality and "Vibe".
-   **Voice Bios**: Record and listen to audio introductions for a more authentic connection.
-   **Gamified Discovery**: "Couple Quiz" games to test compatibility in a fun way.
-   **Real-Time Action**: Chat, Video Calls, and Instant Notifications (Socket.io).
-   **Trust & Safety**: Verified Profiles, Report System, and AI Mediator for conflict resolution.

## 🧠 AI Architecture (Free Lifetime)
This project is architected to run **100% Free** using:
1.  **Voice Transcription**: Runs locally using `Xenova/whisper-tiny` (No API cost).
2.  **Intelligence**: Supports **Google Gemini Pro** (Free Tier) for personality analysis (Vibe Check), matching, and chat assistance.
    - Simply get a free key from [Google AI Studio](https://aistudio.google.com/) and add it as `GEMINI_API_KEY`.
3.  **Fallback**: Includes a local key-word engine if no internet/keys are available.

## 🛠 Tech Stack

-   **Frontend**: Next.js 14, Tailwind CSS, Lucide React
-   **Backend**: Node.js, Express, PostgreSQL
-   **AI**: LangChain, Google Gemini, Xenova Transformers
-   **Realtime**: Socket.io
-   **Storage**: Supabase (Free Tier)/Docker) + pgvector.
-   **Storage**: Supabase Storage / Local Uploads.
-   **Payments**: Razorpay / Cashfree Integration.

## 🏃‍♂️ Getting Started

### Prerequisites
-   Node.js v18+
-   Docker (optional, for real Database)

### Installation

1.  **Clone & Install**
    ```bash
    git clone <repo>
    cd LifePartner-AI
    npm install
    ```

2.  **Start Backend**
    ```bash
    # Terminal 1
    cd backend
    npm run dev
    # Runs on http://localhost:4000
    ```

3.  **Start Frontend**
    ```bash
    # Terminal 2
    cd apps/web
    npm run dev
    # Runs on http://localhost:3000
    ```

## 📂 Project Structure

```
LifePartner-AI/
├── apps/
│   ├── web/            # Next.js Frontend
│   └── mobile/         # React Native (Expo) app (Scaffolded)
├── backend/            # Express API & Vector Search Logic
├── docker-compose.yml  # DB Infrastructure
└── package.json        # Monorepo root
```

## ⚠️ Note on Mock Mode
If Docker is not running, the Backend automatically switches to **Mock Mode**.
-   It will not save data to Postgres.
-   It will return pre-generated "Perfect Matches" to demonstrate the UI.
-   AI Prompt analysis is simulated.
