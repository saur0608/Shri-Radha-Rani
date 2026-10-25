# Shri Radha Rani Devotional E-Commerce Store - Backend API

Production-ready REST API built with Node.js, Express, TypeScript, Zod, and Prisma ORM for PostgreSQL. Designed specifically for Indian devotees purchasing devotional items (Radha Rani poshaks, Laddu Gopal dress sets, shringar jewellery, framed temple portraits, and mandir decorations).

---

## 🌸 Key Architecture & Features

1. **Security & Input Validation:**
   - Strict server-side validation using **Zod** for all bodies, query parameters, and route params.
   - **Never trusts browser prices**: Prices and totals are computed strictly from the PostgreSQL database during quotes and checkouts.
   - **Database Transactions & Atomic Stock Control**: Stock is decremented within atomic transactions to prevent negative stock and race conditions during high festival demand (Janmashtami, Radhashtami).
   - **JWT Authentication** stored in secure `httpOnly` cookies with signed session handling.
   - **Helmet**, **CORS** (credentials enabled), and multi-tier **Rate Limiting** (general, authentication, and checkout).
   - Safe Razorpay secrets isolation: Only public key is shared; private keys & webhook secrets remain on the server.

2. **Database Models (Prisma + PostgreSQL):**
   - `users`: Devotees and Administrators (`CUSTOMER`, `ADMIN`).
   - `addresses`: Multi-address support with default delivery address flags.
   - `categories`: Bilingual (Hindi & English) devotional categories with slugs and ordering.
   - `products`: Base price, discount price, SKU, bilingual titles/descriptions, stock, and collection flags (`isFeatured`, `isBestseller`, `isNewArrival`).
   - `product_images`: Multi-image galleries with primary display flags.
   - `product_variants`: Size (e.g. Size 0 to Size 6, 8 inch to 18 inch) and color variants with independent stock & pricing.
   - `carts` & `cart_items`: Guest sessions and logged-in user carts with automatic cart merge on devotee login.
   - `orders` & `order_items`: Order tracking (`PLACED`, `PACKED`, `SHIPPED`, `DELIVERED`, `CANCELLED`) with stock replenishment on cancellation.
   - `payments`: Razorpay and COD records with payment IDs and raw gateway verification.
   - `coupons`: Percentage and Flat discount codes with minimum order amount and expiry.
   - `reviews`: Product reviews with verified-purchase badges.

---

## 🛠️ API Endpoints Summary

### 1. Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new devotee (10-digit Indian phone, password)
- `POST /api/auth/login` - Login with phone/email and password (sets `httpOnly` cookie)
- `POST /api/auth/logout` - Clear auth cookie
- `GET /api/auth/me` - Current logged-in devotee profile & saved addresses
- `PUT /api/auth/profile` - Update devotee profile
- `POST /api/auth/addresses` - Add new delivery address (6-digit PIN code validated)
- `DELETE /api/auth/addresses/:id` - Remove saved address

### 2. Products & Catalog (`/api/products` & `/api/categories`)
- `GET /api/products` - List products with filters: `category`, `search`, `minPrice`, `maxPrice`, `size`, `color`, `sort`, `page`, `limit`
- `GET /api/products/collections` - Featured products, Bestsellers, and New Arrivals
- `GET /api/products/search/suggestions?q=...` - Live search autocomplete
- `GET /api/products/:slugOrId` - Complete product detail with variants, images, and reviews
- `GET /api/categories` - All active categories with product counts
- `GET /api/categories/:slug` - Single category details

### 3. Shopping Cart (`/api/cart`)
- `GET /api/cart` - View cart (guest `sessionId` or user token)
- `POST /api/cart/items` - Add item / variant to cart (validates live stock)
- `PUT /api/cart/items/:itemId` - Update item quantity
- `DELETE /api/cart/items/:itemId` - Remove item from cart
- `DELETE /api/cart` - Clear cart
- `POST /api/cart/merge` - Merge guest session cart into user cart upon login

### 4. Checkout & Orders (`/api/orders`)
- `POST /api/orders/quote` - Calculate official price quote from DB (subtotal, shipping, discount, total)
- `POST /api/orders` - Place order with atomic stock decrement & transaction
- `GET /api/orders/user` - Devotee order history
- `GET /api/orders/:idOrNumber` - Order details & tracking status

### 5. Coupons (`/api/coupons`)
- `POST /api/coupons/validate` - Validate coupon code against subtotal

### 6. Payments (`/api/payments`)
- `POST /api/payments/razorpay/create-order` - Create Razorpay order from DB total
- `POST /api/payments/razorpay/verify` - Verify Razorpay signature using HMAC-SHA256
- `POST /api/payments/razorpay/webhook` - Server-to-server webhook callback

### 7. Reviews (`/api/reviews`)
- `GET /api/reviews/product/:productId` - Product reviews with average rating
- `POST /api/reviews` - Submit review (marks verified purchase if devotee ordered item)

### 8. Admin Panel (`/api/admin`) - Protected (Role: `ADMIN`)
- `GET /api/admin/dashboard` - Today's orders, revenue, lifetime stats, low-stock alerts
- `POST /api/admin/products` - Create new product with variants & images
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Archive product
- `GET /api/admin/orders` - List all customer orders with status filters & search
- `PUT /api/admin/orders/:id/status` - Update order status (Placed -> Packed -> Shipped -> Delivered -> Cancelled)
- `GET /api/admin/customers` - List customers with order count & lifetime spend
- `GET /api/admin/coupons` - List coupons
- `POST /api/admin/coupons` - Create new discount coupon
- `PUT /api/admin/coupons/:id` - Update coupon
- `DELETE /api/admin/coupons/:id` - Delete coupon
