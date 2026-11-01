# ThinkMart Full-Stack E-Commerce Application
## Architecture Blueprint & Project Structure Plan

**Document Version:** 1.3.0  
**Status:** Approved Master Specification (Pre-Implementation)  
**Target Environment:** Local Development & Academic Portfolio Demonstration  
**Target Java / JDK:** Java 17 LTS (Verified Host Runtime: Oracle OpenJDK 17.0.12 LTS)  
**Target Spring Boot:** Spring Boot 4.1.2 (Active Supported GA Release on Java 17 Baseline)  
**Target Database:** MySQL 8.0+  
**Target Frontend:** React 18, TypeScript, Vite, Tailwind CSS  

---

## 1. Executive Summary & Core Business Rules

ThinkMart is India's premier online tech retail platform, initially prototyped as a high-fidelity static website. This architecture document formalizes the transformation of ThinkMart into an enterprise-grade, production-quality full-stack application while strictly preserving all brand identity, design tokens, business logic, and existing reference assets.

### 1.1 Core Business Invariants
1. **Product Catalog:**
   * 12 verified products across 5 primary categories: `Laptops`, `Smartphones`, `Watches`, `Headphones`, and `Accessories`.
   * Currency: Indian Rupee (`INR` / `₹`).
   * Original MSRP and discounted pricing displayed with savings badges (e.g., `18% OFF`).
2. **Tax & Shipping Rules:**
   * **GST:** 5% goods and services tax applied on the cart subtotal (`Math.round(subtotal * 0.05)`).
   * **Shipping Threshold:** Orders of ₹999 or more qualify for **FREE Shipping** (`₹0`). Orders below ₹999 incur a flat shipping fee of **₹99**.
3. **Authentication & Roles:**
   * `ROLE_CUSTOMER`: Can browse, search, manage cart/wishlist, place orders, and review past orders.
   * `ROLE_ADMIN`: Has administrative privileges to view system metrics, manage inventory, add/edit/delete products, and update order fulfillment statuses.
4. **Existing Asset Preservation:**
   * The static website in the workspace root (`index.html`, `pages/`, `scripts/`, `style/`, `assets/`) remains completely untouched as a reference standard throughout development.

---

## 2. Technology Stack & Official Support Verification

### 2.1 Spring Boot Release & Support Analysis
* **Selected Release:** **Spring Boot 4.1.2** (Latest stable GA patch release of the 4.1.x generation).
* **Official Support Status:**
  * **Active Open Source Software (OSS) Support:** Active through **July 31, 2027**.
  * **Comparison to Older Release Lines:** Earlier lines such as Spring Boot 3.3.x (OSS support ended June 30, 2025) and Spring Boot 3.4.x (OSS support ended with version 3.4.13 on December 31, 2025) have concluded their free community support windows. Using an end-of-OSS-support release would leave the application without security vulnerability patches and maintenance updates. Selecting Spring Boot 4.1.2 provides full, active open-source support and ongoing security maintenance.
* **Java Baseline & Host Compatibility:**
  * Official system requirements for Spring Boot 4.1 require **at least Java 17** up to Java 27.
  * Verified host runtime: `C:\Program Files\Java\jdk-17\bin\java.exe` (`Oracle OpenJDK 17.0.12 LTS`, build `17.0.12+8-LTS-286`).
  * The project cleanly targets Java 17 LTS without requiring runtime upgrade.

### 2.2 Dependency Management Strategy
To avoid dependency version conflicts and ensure transitive compatibility, the project relies strictly on the **Spring Boot Dependency Management System** via `spring-boot-starter-parent:4.1.2`.

* **Exact Resolved Dependency Versions (Verified via `mvn dependency:tree`):**
  * **Spring Boot:** `4.1.2`
  * **Spring Security:** `7.1.2` (`spring-security-config`, `spring-security-core`, `spring-security-web`, `spring-security-test`)
  * **Spring Framework:** `7.0.10` (`spring-web`, `spring-webmvc`, `spring-orm`, `spring-core`, `spring-beans`, `spring-context`)
  * **Hibernate ORM:** `7.4.13.Final`
  * **Hibernate Validator:** `9.1.5.Final`
  * **MySQL Connector/J:** `9.7.0`
  * **Flyway Core & MySQL:** `12.4.0`
  * **Embedded Tomcat:** `11.0.27`

* **No Manual Version Pinning for Managed Dependencies:**
  * `spring-boot-starter-web` (No version tag — managed by parent)
  * `spring-boot-starter-data-jpa` (No version tag — managed by parent)
  * `spring-boot-starter-security` (No version tag — managed by parent)
  * `spring-boot-starter-validation` (No version tag — managed by parent)
  * `com.mysql:mysql-connector-j` (No version tag — managed by parent)
  * `org.flywaydb:flyway-core` and `org.flywaydb:flyway-mysql` (No version tag — managed by parent)
  * `spring-boot-starter-test` and `spring-security-test` (No version tag — managed by parent)
* **Unmanaged Third-Party Dependencies:**
  * Only libraries outside Spring Boot's curated BOM specify explicit versions:
    * `io.jsonwebtoken:jjwt-api:0.12.6`, `jjwt-impl:0.12.6`, `jjwt-jackson:0.12.6`

### 2.3 Frontend Platform
* **Runtime & Package Manager:** Node.js `v22.20.0` / npm `10.9.3` (Host verified).
* **Framework & Build:** React 18, TypeScript 5.x, Vite 5.x.
* **Styling:** Tailwind CSS 3.4.x matching ThinkMart custom tokens (`#172033`, `#6855e8`, etc.).
* **HTTP Client:** Axios 1.7.x with Bearer JWT interceptor and Vite reverse-proxy.

---

## 3. Project Directory Structure

```text
D:\Training_sessions\Java-Full-Stack-VVIT-CSE-A\Ecommerce\
├── docs\
│   └── ARCHITECTURE.md                    # This master architecture specification
├── .env.example                           # Root template for environment variables (No real secrets)
│
├── backend\                               # Spring Boot 4.1.2 + Java 17 REST API Service
│   ├── .mvn\wrapper\
│   │   ├── maven-wrapper.jar              # Maven Wrapper binary
│   │   └── maven-wrapper.properties       # Maven distribution URL (v3.9.9)
│   ├── mvnw                               # Maven Wrapper Unix shell script
│   ├── mvnw.cmd                           # Maven Wrapper Windows command script
│   ├── pom.xml                            # Spring Boot 4.1.2 POM file
│   └── src\
│       ├── main\
│       │   ├── java\com\thinkmart\
│       │   │   ├── ThinkMartApplication.java       # Spring Boot entry point
│       │   │   ├── config\                         # Web, CORS, Security, JPA configs
│       │   │   ├── controller\                     # Health, Auth, Product, Cart, Order, Admin
│       │   │   │   └── HealthController.java       # Phase 2 Health check endpoint (/api/health)
│       │   │   ├── dto\                            # Request & Response DTOs
│       │   │   ├── entity\                         # JPA Domain Entities
│       │   │   ├── exception\                      # Global Exception Handler & error responses
│       │   │   ├── repository\                     # Spring Data JPA Repositories
│       │   │   ├── security\                       # UserDetailsService, JWT Filter, AuthProvider
│       │   │   └── service\                        # Business Services & Admin Initializer
│       │   └── resources\
│       │       ├── application.yml                 # Base config with environment placeholders
│       │       ├── application-dev.yml             # Development profile
│       │       └── db\migration\                   # Incremental, versioned Flyway scripts
│       │           ├── V1__create_users_and_roles_tables.sql
│       │           ├── V2__create_categories_and_products_tables.sql
│       │           ├── V3__seed_thinkmart_initial_catalog.sql
│       │           ├── V4__create_cart_and_wishlist_tables.sql
│       │           └── V5__create_orders_and_order_items_tables.sql
│       └── test\                                   # JUnit 5 & Mockito test suite
│
├── frontend\                              # React 18 + TypeScript + Vite + Tailwind CSS (Phase 5+)
│   ├── package.json
│   ├── vite.config.ts                     # API proxy (/api -> localhost:8080)
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src\
│       ├── main.tsx
│       ├── App.tsx
│       ├── components\
│       ├── context\
│       ├── pages\
│       └── services\
│
└── [Existing Static Website Reference - Intact & Untouched]
    ├── index.html
    ├── pages\
    ├── scripts\
    ├── style\
    └── assets\
```

---

## 4. Hardened Flyway Migration Strategy

```
       ┌──────────────────────┐
       │        users         │
       └──────────┬───────────┘
                  │ 1
                  │
        ┌─────────┴─────────┐
        │                   │ 1
        ▼ *                 ▼
 ┌──────────────┐    ┌──────────────┐
 │    orders    │    │  cart_items  │
 └──────┬───────┘    └──────┬───────┘
        │ 1                 │ *
        │                   ▼
        │ *          ┌──────────────┐
        ▼            │   products   │◀────┐ *
 ┌──────────────┐    └──────┬───────┘     │
 │ order_items  │           │ *           │
 └──────────────┘           │ 1           │
                            ▼             │
                     ┌──────────────┐     │ 1
                     │  categories  │     │
                     └──────────────┘     │
                            ▲             │
                            └─────────────┘
```

### 4.1 Strict Migration Invariants
1. **Versioned & Strictly Ordered:**
   * File naming follows `V<Major>__<Description>.sql` (`V1__...`, `V2__...`, `V3__...`, `V4__...`, `V5__...`).
   * Executed sequentially and atomically tracked in `flyway_schema_history`.
2. **Immutability & Checksum Verification:**
   * Once a migration is executed, its cryptographic checksum is stored.
   * `spring.flyway.validate-on-migrate=true` ensures any post-application modification halts application startup.
3. **Deterministic DDL (Fail on Unexpected Conflicts):**
   * Migration DDL statements use deterministic `CREATE TABLE` without `IF NOT EXISTS`.
   * *Rationale:* `CREATE TABLE IF NOT EXISTS` silently swallows schema divergence. If a table previously existed with incorrect columns, legacy datatypes, or missing constraints, `IF NOT EXISTS` skips execution, leaving the schema corrupted while recording a false success in `flyway_schema_history`. Deterministic DDL guarantees that any unexpected schema conflict **fails fast** before an invalid state is recorded.
4. **Zero Destructive Operations:**
   * No `DROP DATABASE`, `DROP TABLE`, or `TRUNCATE` operations are permitted in migrations.
   * All future schema evolution must occur via additive, forward-only migrations.
5. **Repeatable, Idempotent Seed Data:**
   * Catalog seeding in `V3` uses explicit duplicate-prevention syntax (`INSERT INTO ... ON DUPLICATE KEY UPDATE`) for data rows.
   * Ensures seed data can be re-executed safely across environments without duplicating records or throwing duplicate key exceptions.

---

### 4.2 Migration Script Specifications

#### `V1__create_users_and_roles_tables.sql`
Creates the user storage foundation with role-based authorization:
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(120) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(30) NOT NULL DEFAULT 'ROLE_CUSTOMER',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_users_email UNIQUE (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### `V2__create_categories_and_products_tables.sql`
Creates category and product tables with referential integrity:
```sql
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(60) NOT NULL,
    icon VARCHAR(20) DEFAULT '📦',
    description VARCHAR(255),
    display_order INT NOT NULL DEFAULT 0,
    CONSTRAINT uk_categories_name UNIQUE (name),
    CONSTRAINT uk_categories_slug UNIQUE (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    brand VARCHAR(60) NOT NULL,
    category_id BIGINT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(2, 1) NOT NULL DEFAULT 5.0,
    reviews_count INT NOT NULL DEFAULT 0,
    image_url VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    discount_tag VARCHAR(30),
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    stock_quantity INT NOT NULL DEFAULT 50,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id),
    INDEX idx_products_category (category_id),
    INDEX idx_products_featured (featured),
    INDEX idx_products_brand (brand)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### `V3__seed_thinkmart_initial_catalog.sql`
Seeds only public catalog data (5 categories and 12 official products). **Zero passwords or user credentials are in this script.**
* Seeds 5 categories using idempotent `INSERT INTO ... ON DUPLICATE KEY UPDATE`:
  * Laptops, Smartphones, Watches, Headphones, Accessories.
* Seeds all 12 official ThinkMart products (`tm-laptop-01` through `tm-acc-02`) with exact INR pricing, ratings, images, and descriptions from `products.js`.

#### `V4__create_cart_and_wishlist_tables.sql`
Creates user cart and wishlist tables:
```sql
CREATE TABLE cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_cart_user_product UNIQUE (user_id, product_id),
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE wishlist_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_wishlist_user_product UNIQUE (user_id, product_id),
    CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### `V5__create_orders_and_order_items_tables.sql`
Creates order headers and line item details:
```sql
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(30) NOT NULL,
    user_id BIGINT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) NOT NULL,
    shipping_amount DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    order_status VARCHAR(30) NOT NULL DEFAULT 'PROCESSING',
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Simulated UPI',
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PAID',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_orders_order_number UNIQUE (order_number),
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id),
    INDEX idx_orders_user (user_id),
    INDEX idx_orders_status (order_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    INDEX idx_order_items_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 5. Security & Administrative Account Provisioning

### 5.1 Strict Credentials & Secrets Policy
* **Zero Hardcoded Secrets:** No database passwords, JWT secrets, or administrative credentials are hardcoded in code, migration scripts, or git repositories.
* **Flyway Migration Isolation:** Flyway scripts contain solely schema definitions and public product catalog data. No user accounts with passwords appear in SQL scripts.
* **Environment-Based Configuration:** All sensitive parameters are injected through system environment variables or a local `.env` file (which is git-ignored).

### 5.2 Safe Administrator Account Creation Process
The initial administrator account is provisioned securely during application startup via a Spring Boot `CommandLineRunner` (`AdminInitializer`) in Phase 4:
1. The initializer queries `UserRepository.findByRole("ROLE_ADMIN")`.
2. If an administrator account already exists, the initializer skips creation cleanly and logs confirmation.
3. If no administrator exists:
   * It reads `INITIAL_ADMIN_EMAIL` (defaulting to `admin@thinkmart.in`).
   * **Production Environment Safeguard (`prod` / `production` profile):**
     * `INITIAL_ADMIN_PASSWORD` (or `app.admin.initial-password`) **MUST** be supplied via environment variables.
     * If the password is missing or empty in production, the application **immediately aborts startup** with `IllegalStateException("Production startup failed: app.admin.initial-password must be configured in production.")`.
     * Temporary passwords are **never generated and never logged** in production logs.
     * When configured, the administrator is provisioned and logged as `"Provisioning initial administrator account for '...' from environment configuration."` without exposing the secret.
   * **Development / Local Environment:**
     * If `INITIAL_ADMIN_PASSWORD` is provided, it is used directly.
     * If omitted in local dev, a secure 16-character temporary password is generated and logged once to the developer's console for quick bootstrapping.
   * The password is encrypted with `BCryptPasswordEncoder` (cost factor 10) before storage.
   * It persists the user record with role `ROLE_ADMIN` and `enabled = true`.
4. Subsequent password resets and additional administrator invitations are handled via authenticated admin APIs.

### 5.3 `.env.example` Template
A clean `.env.example` file is placed in the project root containing placeholders only:

```bash
# ==============================================================================
# ThinkMart Environment Configuration Template
# COPY THIS FILE TO .env AND FILL IN YOUR VALUES. DO NOT COMMIT .env TO GIT.
# ==============================================================================

# Server Configuration
SERVER_PORT=8080

# MySQL Database Configuration
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/thinkmart_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=your_db_username
SPRING_DATASOURCE_PASSWORD=your_db_password

# JWT Security Configuration (Generate a strong 256-bit secret key)
JWT_SECRET=your_base64_or_hex_jwt_secret_key_minimum_256_bits_long
JWT_EXPIRATION_MS=86400000

# Initial Admin Bootstrap Configuration (Used only on first startup if no admin exists)
INITIAL_ADMIN_EMAIL=admin@thinkmart.in
INITIAL_ADMIN_PASSWORD=your_secure_initial_admin_password
```

---

## 6. REST API Contract Specification

### 6.1 System Health (Phase 2 Scope)
* `GET /api/health`
  * **Access:** Public
  * **Response (200 OK):**
    ```json
    {
      "status": "UP",
      "service": "thinkmart-backend",
      "version": "1.0.0",
      "timestamp": "2026-11-01T15:30:00"
    }
    ```

### 6.2 Authentication & Profile (Phase 4 Scope)
* `POST /api/auth/register` (Public) — Registers a new customer with BCrypt-hashed password. Returns `201 Created` with JWT token and user profile.
* `POST /api/auth/login` (Public) — Validates credentials and returns `200 OK` with JWT Bearer token.
* `GET /api/auth/me` (Protected) — Returns current user profile claims.
  * Unauthenticated requests (no token or expired/invalid token) return `401 Unauthorized` handled by `JwtAuthenticationEntryPoint`.
* **Security & Authorization Status Codes:**
  * **HTTP 401 Unauthorized:** Returned for unauthenticated access to any protected resource or invalid/expired JWT bearer tokens (`JwtAuthenticationEntryPoint`).
  * **HTTP 403 Forbidden:** Returned when an authenticated user with `ROLE_CUSTOMER` attempts to access an administrator endpoint (`/api/admin/**`) (`CustomAccessDeniedHandler`).
  * **HTTP 400 Bad Request:** Returned for validation errors or invalid request bodies (`GlobalExceptionHandler`).

### 6.3 Product Catalog & Categories (Phase 3 Scope)
* `GET /api/categories` (Public) — Lists all 5 categories.
* `GET /api/products` (Public) — Returns paginated, searchable, category-filtered catalog.
* `GET /api/products/featured` (Public) — Returns 4 featured products for landing page.
* `GET /api/products/{id}` (Public) — Returns individual product detail by ID.

### 6.4 Cart & Wishlist (Phase 6 Scope)
* `GET /api/cart` (Authenticated) — Retrieves user cart items, subtotal, 5% GST tax, shipping fee, and grand total.
* `POST /api/cart/items` (Authenticated) — Adds item to cart.
* `PUT /api/cart/items/{productId}` (Authenticated) — Updates quantity.
* `DELETE /api/cart/items/{productId}` (Authenticated) — Removes item.
* `DELETE /api/cart` (Authenticated) — Empties cart.

### 6.5 Orders & Checkout (Phase 7 Scope)
* `POST /api/orders` (Authenticated) — Places order, calculates 5% GST and ₹99 shipping (free if ≥ ₹999), clears cart.
* `GET /api/orders/my-orders` (Authenticated) — Returns customer's past orders.
* `GET /api/orders/{orderNumber}` (Authenticated) — Returns order receipt.

### 6.6 Admin Operations (Phase 8 Scope)
* `GET /api/admin/dashboard/stats` (`ROLE_ADMIN`) — Revenue, orders count, inventory status.
* `POST /api/admin/products` (`ROLE_ADMIN`) — Creates product.
* `PUT /api/admin/products/{id}` (`ROLE_ADMIN`) — Updates product.
* `DELETE /api/admin/products/{id}` (`ROLE_ADMIN`) — Deletes / deactivates product.
* `GET /api/admin/orders` (`ROLE_ADMIN`) — Lists all orders across customers.
* `PATCH /api/admin/orders/{id}/status` (`ROLE_ADMIN`) — Updates status (`PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).

---

## 7. Development Phases & Strict Phase 2 Scope Boundary

### 7.1 Scope of Phase 2 (Spring Boot Foundation & Migrations Only)
> [!IMPORTANT]
> **Strict Phase 2 Boundaries:**  
> Phase 2 establishes **only** the foundational Spring Boot infrastructure:
> 1. Scaffolding `backend/` directory structure with Maven Wrapper (`mvnw`, `mvnw.cmd`).
> 2. `pom.xml` with Spring Boot `4.1.2` and Java 17, using parent-managed dependencies.
> 3. `application.yml` and `application-dev.yml` with environment-variable placeholders.
> 4. Root `.env.example` template with placeholder values.
> 5. Incremental Flyway migration scripts `V1` through `V5` with deterministic DDL.
> 6. `ThinkMartApplication.java` entry point.
> 7. `HealthController.java` exposing `GET /api/health`.
>
> **Explicitly EXCLUDED from Phase 2:**
> * No product catalog APIs (Phase 3).
> * No authentication, JWT filters, or user registration (Phase 4).
> * No cart or wishlist logic (Phase 6).
> * No checkout, orders, or payments (Phase 7).
> * No admin dashboard or management (Phase 8).
> * No React frontend files (Phase 5).

### 7.2 Phase 5 Scope & Implementation (React Frontend & Catalog Integration)
Phase 5 implements the modern React single-page application integrating with the Spring Boot backend:
1. **Frontend Foundation:** React 18, TypeScript, Vite, Tailwind CSS with ThinkMart color palette tokens (`ink`, `purple`, `lavender`, `green`, `orange`).
2. **API Client & Reverse Proxy:** Axios client with JWT interceptor and Vite reverse-proxy forwarding `/api` to `http://localhost:8080`.
3. **State Management & Auth Context:** `AuthContext` managing authentication state, token storage in `localStorage`, automatic token validation against `GET /api/auth/me`.
4. **Catalogue & Product Browsing:**
   * Dynamic Category filter pills (`All`, `Laptops`, `Smartphones`, `Watches`, `Headphones`, `Accessories`).
   * Keyword search with parameter synchronization.
   * Sorting by price, rating, and featured status.
   * Paginated product grid (`ProductCard`) with discount badges, star ratings, and INR pricing.
5. **Product Detail View:** Dedicated route (`/products/:id`) displaying image showcase, stock status, 5% GST & shipping notices, and full overview.
6. **Authentication UI:** Modern Login and Register views with client-side validation, error handling, and session restoration.
7. **Static Asset Preservation:** All 14 original static HTML/CSS/JS files in root remain completely preserved.

---

## 8. Verification Strategy & Command Specifications

### 8.1 Host Environment Verification (Executed & Passed)
These checks were physically executed on the machine and their results verified:
* **Java 17 Host Runtime:** Passed.
  * Command: `& "C:\Program Files\Java\jdk-17\bin\java.exe" -version`
  * Output: `java version "17.0.12" 2024-07-16 LTS`, `build 17.0.12+8-LTS-286`.
* **Node.js & npm:** Passed (`node v22.20.0`, `npm 10.9.3`).
* **Git Repository Cleanliness:** Passed (`main` branch clean inside `Ecommerce/`).
* **Existing Static Assets:** Passed (14 files verified intact).

### 8.2 Phase 2 Planned Verification Commands
These verification commands will be executed upon approval of Phase 2:
1. **Maven Wrapper Compilation Check:**
   * PowerShell Command: `cd backend; .\mvnw.cmd clean compile`
   * Verification Target: `BUILD SUCCESS` with zero Java compilation errors under JDK 17.
2. **Spring Boot Health Endpoint Probe:**
   * Execution: Run Spring Boot application and invoke `GET /api/health`.
   * Verification Target: HTTP 200 response with `{"status": "UP", ...}`.
3. **Database Connection & Flyway Migration Check (Conditional on DB Availability):**
   * *Status: Planned test.*
   * Condition: Tested only when valid MySQL connection parameters are provided in `.env` and the MySQL service is verified running.
   * PowerShell Command: `cd backend; .\mvnw.cmd flyway:info`
   * Verification Target: Flyway reports 5 migrations (`V1` to `V5`) discovered and pending/applied.
   * *Rule:* A working database connection will not be claimed until the connection probe explicitly succeeds.
