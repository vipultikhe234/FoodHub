# Entity-Relationship Diagram (ERD)

A detailed blueprint of the MySQL relational database architecture underlying FoodHub.

```mermaid
erDiagram
    USERS {
        bigint id PK
        string name
        string email UK
        string phone UK
        string password
        enum role "admin | customer"
        text address
        decimal latitude
        decimal longitude
        timestamp created_at
        timestamp updated_at
    }

    CATEGORIES {
        bigint id PK
        string name
        string image
        boolean status
        timestamp created_at
        timestamp updated_at
    }

    PRODUCTS {
        bigint id PK
        bigint category_id FK
        string name
        text description
        decimal price
        decimal discount_price
        string image
        integer stock
        boolean is_available
        timestamp created_at
        timestamp updated_at
    }

    INVENTORY {
        bigint id PK
        bigint product_id FK
        integer quantity "duplicate for history/tracking"
        integer low_stock_alert
        timestamp updated_at
    }

    OFFERS {
        bigint id PK
        string title
        text description
        integer discount_percentage
        datetime start_date
        datetime end_date
        boolean status
        timestamp created_at
        timestamp updated_at
    }

    CART {
        bigint id PK
        bigint user_id FK
        bigint product_id FK
        integer quantity
        decimal price
        timestamp created_at
        timestamp updated_at
    }

    ORDERS {
        bigint id PK
        bigint user_id FK
        decimal total_price
        enum status "pending | preparing | dispatched | delivered | cancelled"
        enum payment_status "pending | completed | failed"
        text delivery_address
        timestamp created_at
        timestamp updated_at
    }

    ORDER_ITEMS {
        bigint id PK
        bigint order_id FK
        bigint product_id FK
        integer quantity
        decimal price
        timestamp created_at
        timestamp updated_at
    }

    PAYMENTS {
        bigint id PK
        bigint order_id FK
        enum payment_method "stripe | razorpay | cod"
        string transaction_id
        decimal amount
        enum status "pending | completed | failed | refunded"
        timestamp created_at
        timestamp updated_at
    }

    REVIEWS {
        bigint id PK
        bigint user_id FK
        bigint product_id FK
        integer rating "1 to 5"
        text comment
        timestamp created_at
        timestamp updated_at
    }

    USERS ||--o{ ORDERS : "places"
    USERS ||--o{ CART : "owns"
    USERS ||--o{ REVIEWS : "writes"
    CATEGORIES ||--o{ PRODUCTS : "contains"
    PRODUCTS ||--o{ INVENTORY : "monitors"
    PRODUCTS ||--o{ CART : "added_to"
    PRODUCTS ||--o{ ORDER_ITEMS : "included_in"
    PRODUCTS ||--o{ REVIEWS : "receives"
    ORDERS ||--o{ ORDER_ITEMS : "has_many"
    ORDERS ||--|| PAYMENTS : "paid_via"
```

## Schema Explanation

- **Users**: Central point to manage application access. Has a specific `role` enum field restricting Admin endpoints, along with geolocation inputs.
- **Categories & Products**: Form the base menu functionality. The application supports an `is_available` flag to quickly disable a product overriding strictly manual stock level checks.
- **Inventory**: Serves as a more granular tracker over simple row manipulation per transaction—monitoring low bounds.
- **Orders**: Relates 1:N with `ORDER_ITEMS`. Follows a strict enumerated status pipeline tracking prep and logistic delivery. A single reference holds its respective payment mechanism record `PAYMENTS`.
- **Cart**: Functions as a temporary cache of what the user is preparing to purchase. Once transitioning to checkout, data persists into `ORDERS` & `ORDER_ITEMS`.
