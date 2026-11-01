# ThinkMart — Full-Stack E-Commerce Platform

> **Modern, enterprise-grade full-stack technology retail platform built with Spring Boot 4.1.2 (Java 17 LTS), React 18, TypeScript, Vite, Tailwind CSS, and Flyway database migrations.**

[![Backend Tests](https://img.shields.io/badge/Backend%20Tests-124%20Passed-brightgreen)](backend/)
[![Frontend Tests](https://img.shields.io/badge/Frontend%20Tests-66%20Passed-brightgreen)](frontend/)
[![Java](https://img.shields.io/badge/Java-17%20LTS-orange)](https://openjdk.org/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.2-green)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-teal)](https://tailwindcss.com/)

---

## 1. Overview & Architecture

ThinkMart is India's premier online tech retail platform designed to provide an ultra-fast, reliable, and secure shopping experience. The architecture pairs a server-authoritative Spring Boot REST backend with an interactive React single-page frontend.

### Technology Stack
* **Backend:** Spring Boot 4.1.2 (Active GA release on Java 17 LTS baseline)
* **Security:** Spring Security 7.1.2, JJWT 0.12.6 (Stateless JWT Bearer Authentication, BCrypt password hashing, RBAC)
* **Persistence & ORM:** Spring Data JPA, Hibernate 7.4.13, HikariCP Connection Pooling
* **Database & Migrations:** MySQL 8.0+ (Production target) / Embedded H2 (Automated Test Suite), Flyway 12.4.0 (DDL versions V1 through V6)
* **Frontend:** React 18.3.1, TypeScript 5.7.3, Vite 5.4.14, Tailwind CSS 3.4.17, Axios, Lucide React
* **Test Suites:** JUnit 5, Mockito, Spring Security Test (Backend 124 tests); Vitest, React Testing Library (Frontend 66 tests)

---

## 2. Completed Features

### Customer Experience (Storefront)
1. **Dynamic Product Catalog & Filtering:**
   * Browse verified products across 5 primary categories: *Laptops, Smartphones, Watches, Headphones, Accessories*.
   * Multi-field search by product name, brand, or description.
   * Filter by category pill with instant URL state synchronization.
   * Sort by Price (Low to High, High to Low), Customer Rating, and Newest arrivals.
   * Product detail page with image showcase, specs, stock indicator, and discount tags.
2. **User Authentication & Authorization:**
   * User registration with full name, email, phone number, and password validation.
   * Login with email and password returning signed JWT Bearer tokens.
   * Automatic session restoration from `localStorage` with `GET /api/auth/me` profile validation.
   * Role-based access control (`ROLE_CUSTOMER` and `ROLE_ADMIN`).
3. **Shopping Cart:**
   * Persistent database-backed shopping cart for authenticated users.
   * Add items, increment/decrement quantities, remove line items, or empty cart.
   * **Server-Authoritative Totals:** 5% GST tax calculation and flat ₹99 shipping (free shipping automatically applied for subtotals ≥ ₹999).
4. **Wishlist:**
   * Save favorite products with instant heart toggle.
   * Duplicate item prevention and stock availability indicators.
5. **Checkout & Order Creation:**
   * Multi-step checkout with delivery address and contact details validation.
   * Real-time order review with authoritative backend price recalculation (client-submitted prices are never trusted).
   * **Inventory Integrity:** Pessimistic write locks (`SELECT ... FOR UPDATE`) in canonical product ID order to eliminate database deadlocks, combined with atomic conditional stock decrements (`UPDATE ... WHERE stock_quantity >= quantity`).
   * **Durable Idempotency:** End-to-end duplicate-order prevention using unique idempotency keys, pre-transaction verification, isolated transaction rollback recovery (`TransactionTemplate`), and request payload consistency validation.
6. **Simulated Payment Gateway:**
   * Supports Simulated UPI, Credit/Debit Cards, NetBanking, and Cash on Delivery.
   * Test failure toggle hook (`simulateFailure: true`) to verify transactional rollback and cart preservation.
7. **Order History & Receipts:**
   * Customer order history list (`/orders`) with order reference, item counts, and status badges.
   * Detailed digital receipt view (`/orders/:orderNumber`) with line item snapshots, tax/shipping breakdown, and fulfillment tracking stepper.

### Admin Operations Center (`/admin`)
1. **Operations Dashboard & KPI Metrics:**
   * Gross Revenue calculation (authoritatively excluding cancelled orders).
   * Total Orders count with pipeline breakdown (Processing, Shipped, Delivered, Cancelled).
   * Total Catalog Items and Low Stock Alerts (items with inventory ≤ 10 units).
2. **Product Catalog Management:**
   * View all catalog items with stock quantities and status badges.
   * Search and filter products by name, brand, or product ID.
   * Create new products with slug generation, category assignment, and image URL.
   * Edit existing product details, pricing, discount badges, and stock levels.
   * Delete products with safe cascading cleanup.
3. **Fulfillment & Order Pipeline:**
   * View all orders across all customers with customer contact details and delivery addresses.
   * Filter orders by status (`PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
   * Update order fulfillment status with automatic COD payment settlement upon delivery.

---

## 3. Project Directory Structure

```text
Ecommerce/
├── README.md                              # This master documentation
├── .env.example                           # Safe configuration template (No secrets)
├── .gitignore                             # Git exclusion rules (builds, node_modules, secrets)
├── index.html                             # Original static website home page (Preserved)
├── pages/                                 # Original static website pages (7 pages preserved)
│   ├── About.html
│   ├── Cart.html
│   ├── Contact.html
│   ├── Home-Page.html
│   ├── Login.html
│   ├── Products.html
│   └── Register-Page.html
│
├── backend/                               # Spring Boot 4.1.2 REST API Service
│   ├── .mvn/wrapper/                      # Maven Wrapper 3.9.9 binaries & properties
│   ├── mvnw                               # Maven Wrapper Unix script
│   ├── mvnw.cmd                           # Maven Wrapper Windows script
│   ├── pom.xml                            # Spring Boot 4.1.2 Maven POM
│   ├── .gitignore                         # Backend Git ignore rules
│   └── src/
│       ├── main/
│       │   ├── java/com/thinkmart/
│       │   │   ├── ThinkMartApplication.java
│       │   │   ├── config/                # Web, CORS, Security configuration
│       │   │   ├── controller/            # REST API Controllers (Auth, Product, Cart, Order, Admin)
│       │   │   ├── dto/                   # Request & Response Data Transfer Objects
│       │   │   ├── entity/                # JPA Entities (User, Category, Product, CartItem, Order, OrderItem)
│       │   │   ├── exception/             # GlobalExceptionHandler and custom exceptions
│       │   │   ├── repository/            # Spring Data JPA Repositories
│       │   │   ├── security/              # JWT Filters, Token Provider, Admin Initializer
│       │   │   └── service/               # Core business services & implementation classes
│       │   └── resources/
│       │       ├── application.yml        # Base configuration with environment variable placeholders
│       │       ├── application-dev.yml    # Development logging profile
│       │       ├── application-prod.yml   # Production-hardened connection pool & logging profile
│       │       └── db/migration/          # Flyway SQL migrations (V1 to V6)
│       └── test/                          # Comprehensive JUnit 5 & Mockito test suite (124 tests)
│
├── frontend/                              # React 18 + TypeScript + Vite Single Page App
│   ├── package.json                       # Dependencies & build scripts
│   ├── tsconfig.json                      # TypeScript strict configuration
│   ├── vite.config.ts                     # Reverse-proxy (/api -> http://localhost:8080)
│   ├── tailwind.config.js                 # ThinkMart theme tokens & colors
│   ├── index.html                         # SPA Entry HTML
│   ├── .gitignore                         # Frontend Git ignore rules
│   └── src/
│       ├── main.tsx                       # React DOM root
│       ├── App.tsx                        # Client-side router & providers
│       ├── components/                    # Reusable UI (Navbar, Footer, ProductCard, LoadingSpinner)
│       ├── context/                       # State Providers (AuthContext, CartContext, WishlistContext)
│       ├── pages/                         # Route Views (Home, Products, Detail, Cart, Wishlist,
│       │                                  #   Checkout, Confirmation, Orders, Receipt, Admin, Login, Register)
│       ├── services/                      # Axios HTTP client with JWT interceptor (api.ts)
│       ├── types/                         # TypeScript Domain & API interfaces
│       └── test/                          # Vitest & React Testing Library test suites (18 suites, 66 tests)
│
└── docs/
    └── ARCHITECTURE.md                    # Detailed architecture blueprint & engineering specifications
```

---

## 4. Database Schema & Flyway Migrations

Database schema versioning is managed strictly through **Flyway**. Migrations run automatically at startup and are deterministic and non-destructive.

| Migration File | Purpose | Key Tables / Constraints |
| :--- | :--- | :--- |
| `V1__create_users_and_roles_tables.sql` | User accounts & roles | `users` (`id`, `email UNIQUE`, `password_hash`, `role`) |
| `V2__create_categories_and_products_tables.sql` | Category & Product tables | `categories`, `products` (`category_id FK`, `price`, `stock_quantity`) |
| `V3__seed_thinkmart_initial_catalog.sql` | Initial catalog seed | 5 categories, 12 verified products with specs and pricing |
| `V4__create_cart_and_wishlist_tables.sql` | Persistent cart & wishlist | `cart_items` (`uk_cart_user_product UNIQUE`), `wishlist_items` |
| `V5__create_orders_and_order_items_tables.sql` | Orders & line-item snapshots | `orders` (`order_number UNIQUE`, `user_id FK`), `order_items` |
| `V6__add_idempotency_key_to_orders.sql` | Durable idempotency | `orders.idempotency_key` with `uk_orders_idempotency_key UNIQUE` |

---

## 5. API Overview

All API endpoints are prefixed with `/api`. Authenticated endpoints require an `Authorization: Bearer <token>` header.

### Public Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check & service status |
| `POST` | `/api/auth/register` | Register new customer account |
| `POST` | `/api/auth/login` | Authenticate credentials & return JWT |
| `GET` | `/api/categories` | List all product categories |
| `GET` | `/api/products` | Paginated product search, category filter, and sorting |
| `GET` | `/api/products/{id}` | Retrieve individual product specifications |
| `GET` | `/api/products/featured` | Retrieve featured homepage products |

### Customer Endpoints (`ROLE_CUSTOMER` / `ROLE_ADMIN`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `GET` | `/api/cart` | Get shopping cart with authoritative totals |
| `POST` | `/api/cart/items` | Add item to cart |
| `PUT` | `/api/cart/items/{productId}` | Update quantity of cart item |
| `DELETE` | `/api/cart/items/{productId}` | Remove item from cart |
| `DELETE` | `/api/cart` | Clear entire shopping cart |
| `GET` | `/api/wishlist` | Retrieve saved wishlist items |
| `POST` | `/api/wishlist/items` | Add product to wishlist |
| `DELETE` | `/api/wishlist/items/{productId}` | Remove product from wishlist |
| `GET` | `/api/wishlist/check/{productId}` | Check if product is in wishlist |
| `POST` | `/api/orders` | Place order with address validation & stock reduction |
| `GET` | `/api/orders/my-orders` | List authenticated user's past orders |
| `GET` | `/api/orders/{orderNumber}` | Retrieve order digital receipt |

### Administrator Endpoints (`ROLE_ADMIN`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard/stats` | Aggregate metrics (revenue, orders, products, low stock) |
| `GET` | `/api/admin/products` | List all catalog products for administration |
| `POST` | `/api/admin/products` | Create new product |
| `PUT` | `/api/admin/products/{id}` | Update existing product |
| `DELETE` | `/api/admin/products/{id}` | Delete product |
| `GET` | `/api/admin/orders` | List all customer orders |
| `PATCH` | `/api/admin/orders/{id}/status` | Update fulfillment status (`PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`) |

---

## 6. Local Execution Guide

### Prerequisites
* **Java:** JDK 17 LTS or higher installed (`java -version`).
* **Node.js:** Node.js v18+ and npm v9+ installed (`node -v`).
* **MySQL:** (Optional for development/test; test suite automatically runs on embedded H2).

### Step 1: Environment Configuration
1. Copy the template to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```
2. Configure your values:
   ```properties
   SERVER_PORT=8080
   SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/thinkmart_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   SPRING_DATASOURCE_USERNAME=root
   SPRING_DATASOURCE_PASSWORD=your_password
   JWT_SECRET=dGhpbmttYXJ0LXNlY3VyZS1qd3Qtc2VjcmV0LWtleS1mb3ItZGV2ZWxvcG1lbnQtYXVkaXQtb25seS0yMDI2
   INITIAL_ADMIN_EMAIL=admin@thinkmart.in
   INITIAL_ADMIN_PASSWORD=AdminPassword@2026
   CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
   ```

### Step 2: Start the Backend Service
From the `backend/` directory:
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
* The API will start on **http://localhost:8080**.
* Health check: `http://localhost:8080/api/health`

Alternatively, execute the packaged production JAR:
```powershell
java -jar target/thinkmart-backend-1.0.0.jar
```

### Step 3: Start the Frontend Application
From the `frontend/` directory in a new terminal:
```powershell
cd frontend
npm install
npm run dev
```
* The Vite dev server will start on **http://localhost:5173**.
* Proxy configuration automatically routes all `/api` requests to `http://localhost:8080`.

---

## 7. Automated Testing & Verification

### Backend Tests (124 Tests — All Passing)
```powershell
cd backend
.\mvnw.cmd test
```
* **Status:** 124 tests run, 0 failures, 0 errors, 0 skipped.
* Tests verify security filters, JWT lifecycle, atomic conditional stock decrement, pessimistic write locking, durable idempotency, payload consistency, and admin operations.

### Frontend Tests (66 Tests — All Passing)
```powershell
cd frontend
npm test
```
* **Status:** 18 test files passed, 66 tests passed, 0 failures.
* Tests verify `AuthContext`, `CartContext`, `WishlistContext`, product search and filtering, checkout form validation, simulated payment decline banners, order history, and admin dashboard operations.

### Frontend Production Build
```powershell
cd frontend
npm run build
```
* **Status:** Built in ~3.8s with zero TypeScript or bundling errors. Output written to `frontend/dist/`.

---

## 8. Deployment Instructions

### Standalone Server Deployment (Ubuntu / Debian / Windows Server)
1. **Build artifacts:**
   ```powershell
   cd backend; .\mvnw.cmd package -DskipTests
   cd ../frontend; npm run build
   ```
2. **Export environment variables:**
   ```bash
   export SPRING_PROFILES_ACTIVE=prod
   export SPRING_DATASOURCE_URL="jdbc:mysql://<db-host>:3306/thinkmart_db?useSSL=true&requireSSL=true"
   export SPRING_DATASOURCE_USERNAME="<db-user>"
   export SPRING_DATASOURCE_PASSWORD="<db-password>"
   export JWT_SECRET="<generate-random-256-bit-key>"
   export INITIAL_ADMIN_PASSWORD="<strong-password>"
   export CORS_ALLOWED_ORIGINS="https://your-domain.com"
   ```
3. **Run backend:**
   ```bash
   java -jar thinkmart-backend-1.0.0.jar --spring.profiles.active=prod
   ```
4. **Serve frontend:** Serve `frontend/dist/` via Nginx or Caddy, proxying `/api` to port 8080.

---

## 9. Current Limitations & Clarifications

1. **Simulated Payments Only:**
   - Real payment gateways (Razorpay, Stripe, Paytm) are not integrated. The application implements simulated payments (Simulated UPI, Cards, NetBanking, COD) with realistic checkout workflows, idempotency protection, and simulated failure hooks.
2. **MySQL Database Requirement:**
   - For standalone or production execution, a running MySQL 8.0+ server is required. In the local development environment, the automated test suite runs against the in-memory H2 database engine. Live MySQL integration on port 3306 was not active during initial repository preparation.
3. **No Real Secrets in Source Control:**
   - The repository uses placeholder variables. Secret keys must be supplied via environment variables or a local `.env` file.
