# FoodHub API Documentation

All routes assume an implicit `/api/v1` prefix unless stated otherwise.
Requires `Accept: application/json` headers on every unified wrapper response.

## Authentication (Laravel Sanctum JWT)

### User Registration
- **Endpoint**: `POST /register`
- **Payload**: `name`, `email`, `phone`, `password`, `password_confirmation`, `role`
- **Response**: Returns a JSON User Object and Bearer `access_token`.

### User Login
- **Endpoint**: `POST /login`
- **Payload**: `email` or `phone`, `password`
- **Response**: Returns a JSON User Object and Bearer `access_token`.

### Get Profile (Protected)
- **Endpoint**: `GET /profile`
- **Headers**: `Authorization: Bearer <valid_token>`
- **Response**: User object details including active addresses.

### Logout (Protected)
- **Endpoint**: `POST /logout`
- **Headers**: `Authorization: Bearer <valid_token>`
- **Response**: Destroys server-side tokens and signs out the user.

---

## Menu & Products

### Categories
- `GET /categories`: Returns array of active categories nested under `data`.
- `POST /categories`*(Admin)*: Upload `name`, `image` (file).
- `PUT /categories/{id}`*(Admin)*: Update structure or disable visibility.
- `DELETE /categories/{id}`*(Admin)*: Soft or hard delete depending on relational constraints.

### Products
- `GET /products`: Returns paginated products. Query parameters can filter by `category_id` or string search `?q=burger`.
- `GET /products/{id}`: Returns extended details on a single product (including its inventory tracking and aggregated reviews).
- `POST /products`*(Admin)*: Payload requires `category_id`, `name`, `price`, `description`, `stock`, `discount_price` (optional), and an `image`.
- `PUT /products/{id}`*(Admin)*: Allows modification over basic pricing, statuses.
- `DELETE /products/{id}`*(Admin)*: Removes item off public view lists.

---

## Cart Operations (Protected)

- `GET /cart`: Retrieve active cart items tied to the authenticated `user_id`. Will aggregate subtotals server-side.
- `POST /cart/add`: Payload: `product_id`, `quantity`. Updates existing quantity or injects a new row.
- `DELETE /cart/remove`: Payload: `product_id` or `cart_item_id`. Decouples relation.

---

## Orders & Processing (Protected)

- `GET /orders`: Array of previous orders linked to user. Admins receive all paginated queries on index (filtering possible via `?status=pending`).
- `GET /orders/{id}`: Extracted detail containing embedded `ORDER_ITEMS`, receipt history, and delivery progression status.
- `POST /orders`: Finalizes Cart. Requires `payment_method` and `delivery_address`. Will verify `stock` in one transaction. Generates `PAYMENTS` ID for stripe interception or confirms Cash On Delivery. Will push an event firing Firebase notification on success.

---

## Special Operations

### Offers
- `GET /offers`: Pulled actively on mobile launch presenting live promotional codes.
- `POST /offers`*(Admin)*: Structure a new promotion setting `discount_percentage` over valid timestamps.

### Reviews
- `GET /reviews/product/{id}`: Public route reading an array of star rating outputs mapped to user names.
- `POST /reviews`*(Protected)*: Users require verify previously purchased validation. Accepts `product_id`, `rating` (integer 1-5) and `comment`.

## Security Implementations
- Bearer/Token Authentication (Sanctum)
- Input Sanitization & Type enforcement over FormRequests
- Throttle Rate Limit (prevents abusive requests 60/minute)
- Role Policies prevent standard `user_id` accessing `*(Admin)*` explicitly marked routes.
