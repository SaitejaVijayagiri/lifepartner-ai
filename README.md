# Life Partner AI

**Life Partner AI** is a next-generation matrimony platform that uses Generative AI to match users based on values, emotional compatibility, and life vision—not just biodata.

## 🚀 Key Features

-   **Prompt-Based Matching**: Users describe their ideal partner in natural language. AI extracts values and personality traits.
-   **Psychometric Analysis**: Matches are scored based on Big 5 Personality compatibility and Life Vision alignment.
-   **Relationship Simulation**: "Simulate Conflict" feature predicts how a couple would handle real-world stress (e.g., finances).
-   **AI Mediator**: Chat system detects toxicity and offers mediation suggestions during conflicts.
-   **Safety First**: Automated "Red Flag" detection for manipulation and unrealistic expectations.

## 🛠 Tech Stack

-   **Frontend**: Next.js 14 (App Router), TailwindCSS, TypeScript.
-   **Backend**: Node.js, Express, TypeScript.
-   **AI**: LangChain.js (Mocked for demo, pluggable with OpenAI/Ollama).
-   **Database**: PostgreSQL + pgvector + PostGIS (Dockerized).

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
