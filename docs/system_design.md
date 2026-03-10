# System Design Workflow (FoodHub)

A comprehensive look at how individual services run and interact with the backend API.

```mermaid
graph TD
    subgraph "Clients"
    Customer[Customer - Android App]
    Admin[Admin - React Dashboard]
    end

    subgraph "API Gateway / Proxy"
    Nginx[Nginx Reverse Proxy & Load Balancer]
    end

    Customer -->|RESTful JSON API| Nginx
    Customer -->|WebSockets Real-time| Nginx
    Admin -->|RESTful JSON API| Nginx

    subgraph "Backend System (Laravel 11)"
    Router[Routing Layer & Middleware]
    Controller[Controllers]
    Service[Service Layer]
    Repository[Repository Layer]
    JobQ[Job Queue Workers]
    
    Nginx --> Router
    Router --> Controller
    Controller --> Service
    Service --> Repository
    Service --> JobQ
    end

    subgraph "Data Storage"
    MySQL[(MySQL Primary Database)]
    Redis[(Redis Cache System)]
    end

    Repository --> MySQL
    Repository --> Redis
    Service --> Redis

    subgraph "External Integrations"
    FCM[Firebase Cloud Messaging]
    Stripe[Stripe / Razorpay Payment]
    Pusher[Real-time Events / WebSockets]
    end

    JobQ -->|Push Notifications| FCM
    Service -->|Payment Processing| Stripe
    Service -->|Broadcast Events| Pusher
    Pusher -->|Notify| Customer

    style MySQL fill:#008080,stroke:#333
    style Redis fill:#FF4040,stroke:#333
    style Customer fill:#4C9BB8,stroke:#333
    style Admin fill:#4C9BB8,stroke:#333
    style Stripe fill:#7D5BC0,stroke:#333
    style FCM fill:#F57C00,stroke:#333
```

## System Workflow Description

1. **Client Interaction**: Clients (Admin Dashboard or Mobile User) send requests via standard HTTP methods or connect via WebSockets to listen to server-side events. Nginx sits in front and acts as a load balancer and proxy.
2. **Controllers & Validation**: Requests land on Laravel matching Route, go through the Middleware (for example, JWT authentication verification via Sanctum). Then, Controllers handle incoming formatted request validation and pass execution to the Services.
3. **Service layer**: Represents the business logic interface. Validates things like low-stock verification or applying a coupon discount.
4. **Repositories**: Act as an abstraction layer above Eloquent ORM. Perform read/writes to MySQL or Redis.
5. **Background Workers**: Sending order notifications, updating analytics, or interacting with Firebase is sent over to queue workers that run independently.
6. **Integrations**: Interactions directly hit third-party API gateways. WebSockets broadcast state updates, allowing user views to alter automatically.
