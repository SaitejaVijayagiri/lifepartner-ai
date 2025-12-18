# Authentication & Security Flow

## Login Flow (Secure)
```mermaid
sequenceDiagram
    participant User
    participant Client
    participant API
    participant DB

    User->>Client: Enter Email + Pass
    Client->>API: POST /auth/login
    API->>DB: Fetch User & Hash
    API->>API: Validate Argon2 Hash
    
    alt Success
        API->>Client: Return AccessToken (15m, JSON)
        API->>Client: Set RefreshToken (7d, HttpOnly Cookie)
        Client->>User: Dashboard
    else Failure
        API->>Client: 401 Unauthorized
    end
```

## Privacy & Profile View Level
```mermaid
graph TD
    A[Viewer] -->|Request Profile| B{Relation Status?}
    B -->|None| C[Public View (Redacted)]
    B -->|Interest Sent| C
    B -->|Accepted| D[Private View (Full Contact Info)]
    B -->|Blocked| E[Access Denied]
```
