# API Documentation

Base URL: `http://localhost:4000`

## Auth
-   **POST** `/auth/register`
    -   Body: `{ email, password, full_name, age, gender, location }`
    -   Returns: `{ token, userId }`
-   **POST** `/auth/login`
    -   Body: `{ email, password }`
    -   Returns: `{ token }`

## Profile
-   **POST** `/profile/prompt`
    -   Body: `{ prompt: "I want a partner..." }`
    -   Description: Triggers AI analysis. Parses values/traits and generates embedding.
    -   Returns: `{ success: true, analysis: { ... } }`
-   **GET** `/profile/me`
    -   Returns: Current user profile and prompt analysis.

## Matches
-   **GET** `/matches/recommendations`
    -   Returns: List of top compatible profiles.
    -   Response:
        ```json
        {
          "matches": [
            {
              "id": "1",
              "score": 95,
              "analysis": { "emotional": 92, "vision": 98 }
            }
          ]
        }
        ```

-   **POST** `/matches/:id/simulation`
    -   Body: `{ scenario: "Financial Stress" }` (Optional)
    -   Description: Runs an AI roleplay simulation between You and Match ID.
    -   Returns: `{ scenario, outcome, script: [...] }`
