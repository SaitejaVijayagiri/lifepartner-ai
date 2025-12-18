# System Architecture

## Architecture Diagram

```mermaid
graph TD
    User[User (Web/Mobile)] -->|HTTP/JSON| LB[Load Balancer]
    LB -->|/api| BE[Backend API (Node.js/Express)]
    
    subgraph "AI Engine"
        BE -->|Prompt| LangChain
        LangChain -->|Text| LLM[LLM (OpenAI/Mistral)]
        LangChain -->|Query| VectorDB
    end
    
    subgraph "Data Layer"
        BE -->|Read/Write| PrimaryDB[(PostgreSQL)]
        PrimaryDB -->|Relational| UsersTable
        PrimaryDB -->|Vectors| pgvector
        PrimaryDB -->|Geospatial| PostGIS
    end
    
    subgraph "Real-time"
        BE <-->|Socket.io| SocketServer
        SocketServer -->|Mediator Logic| SentimentAnalysis
    end
```

## Matching Logic Design

The **"Perfect Plan"** uses a Hybrid Search approach:

1.  **Hard Filtering (SQL)**:
    -   First, filter candidates by **Dealbreakers** (Smoker: No, Age: 25-30).
    -   Filter by **Location Radius** (PostGIS) if `Relocation=False`.

2.  **Semantic Ranking (Vector)**:
    -   Convert User Prompt -> Embedding Vector ($V_{user}$).
    -   Calculate Cosine Similarity against filtered candidates.

3.  **Psychometric Re-Ranking**:
    -   Candidates with high vector scores are re-scored using specific traits.
    -   *Formula*: `Score = (VectorSim * 0.5) + (Big5Compat * 0.3) + (ValuesMatch * 0.2)`.

4.  **Simulation & Prediction**:
    -   Top matches are fed into an LLM Scenario Generator.
    -   "Simulate a fight about X" -> LLM generates dialogue based on User A and User B's psych profiles.
