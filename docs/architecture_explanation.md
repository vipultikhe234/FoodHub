# System Architecture Explanation

FoodHub is built using a modern, scalable microservice-inspired architecture, though implemented initially as a robust monolithic REST API backend communicating with external services. This design ensures separation of concerns, scalability, and high performance.

## Key Components

### 1. Presentation Layer (Frontend Clients)
- **Admin Dashboard (React.js + Vite)**: A Single Page Application (SPA) designed for administrators to manage operations, view analytics, and track inventory. Uses React Query for state and asynchronous data management, and Material UI/Tailwind for a premium UI.
- **Customer Mobile App (React.js + Capacitor)**: An Android hybrid app that provides end-users a seamless way to browse menus, place orders, and track them. Capacitor wraps the React components into a performant Android app wrapper.

### 2. Business Logic Layer (Laravel 11 Backend API)
The Laravel backend strictly follows a layered architectural pattern:
- **Controllers**: Handle HTTP requests, manage middleware, and return standardized JSON HTTP responses (using Request Validation and API Resources).
- **Services**: Contain the core business logic (e.g., calculating order totals, handling cart logic, integrating payment gateways). This avoids fat controllers and improves testability.
- **Repositories**: Handle direct database access and Eloquent ORM queries. By abstracting the data layer, we make the business logic independent of the specific database structure.
- **DTOs (Data Transfer Objects)**: Used to strongly type data moving from the presentation layer (Requests) into the Service layer.

### 3. Asynchronous & Real-time Layer
- **Job Queues**: Heavy tasks such as sending emails, processing payments, or compiling analytics are pushed to an asynchronous Queue system. 
- **WebSockets / Pusher**: Enables real-time, bi-directional communication. When an order status changes (e.g., from `preparing` to `dispatched`), the backend pushes an event which the Mobile App receives instantly to update the UI.

### 4. Cache & Data Layer
- **MySQL Database**: Primary relational data store for robust ACID-compliant transaction handling (crucial for accurate order and inventory management).
- **Redis Cache (Optional but recommended)**: Stores frequently accessed data like the active menu or hot categories to reduce database loading and increase API response speed.

### 5. Third-Party Integrations
- **Payment Gateways (Stripe / Razorpay)**: Secured transaction processing.
- **Firebase Cloud Messaging (FCM)**: Push notification delivery service for real-time mobile alerts.

## Why this Architecture?
- **Scalability**: Decoupling the frontends from the backend means client applications can scale independently. Stateless JWT authentication allows horizontally scaling the API servers behind a load balancer without maintaining session state.
- **Maintainability**: The Repository-Service pattern isolates logic, meaning if the database schema or a third-party SDK changes, you only need to update code in one specific layer.
- **Performance**: Real-time tools (WebSockets) and background processing (Queues) prevent blocking primary threads, ensuring users receive immediate HTTP responses.
