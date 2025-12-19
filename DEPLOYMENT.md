# Deployment Guide 🚀

Currently, **Life Partner AI** runs in **Mock Mode** for easy local testing. This guide explains how to deploy the **Real Production Version**.

## 1. Prerequisites
-   **Cloud Provider**: Render, DigitalOcean, or AWS.
-   **Database**: Managed PostgreSQL with `pgvector` extension (e.g., Supabase or Neon.tech).
-   **AI**: OpenAI API Key.

## 2. Infrastructure Setup (Docker)

If you have Docker installed, you can switch to the Production Database locally:

1.  **Uncomment Database Code**:
    -   Ensure `backend/src/server.ts` uses real DB connection.
2.  **Run Production Build**:
    ```bash
    # Remove old containers if any
    docker-compose down

    # Start Production Environment (Backend + Frontend + DB)
    docker-compose -f docker-compose.prod.yml up -d --build
    ```
3.  **Run Migrations**:
    ```bash
    # Connect to DB container and run schema
    docker exec -it life_partner_db psql -U admin -d lifepartner -f src/db/init.sql
    ```
4.  **Access App**:
    -   Frontend: http://localhost:3000
    -   Backend: http://localhost:4000

## 3. Deploying to Render.com (Web + Backend)

### Backend (Web Service)
1.  Connect your Repo.
2.  **Build Command**: `cd backend && npm install && npm run build`
3.  **Start Command**: `cd backend && npm start`
4.  **Environment Variables**:
    -   `DATABASE_URL`: `postgres://...`
    -   `GEMINI_API_KEY`: `AIza...` (Free Tier)
    -   `OPENAI_API_KEY`: (Optional)
    -   `CASHFREE_APP_ID`: ...
    -   `CASHFREE_SECRET_KEY`: ...
    -   `SUPABASE_URL`: ...
    -   `SUPABASE_KEY`: ...
    -   `JWT_SECRET`: ...

### Frontend (Static Site)
1.  Connect your Repo.
2.  **Build Command**: `cd apps/web && npm install && npm run build`
3.  **Publish Directory**: `apps/web/.next`
4.  **Environment Variables**:
    -   `NEXT_PUBLIC_API_URL`: `https://your-backend-url.onrender.com`

## 4. Scaling
-   **Horizontal Scaling**: spin up more Backend instances behind a Load Balancer.
-   **Vector DB**: Move from local pgvector to **Pinecone** or **Weaviate** for billion-scale matching.
