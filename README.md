# 🌍 Wanderlust — Enterprise Travel Stay Marketplace

An enterprise-ready, mobile-first vacation rental marketplace built with **Node.js, Express 5, MongoDB, and EJS**. 

---

## 🚀 Key Modules & Architecture

### 1. Robust Layered Architecture (MVC + Service + Repository)
- **Controllers**: Thin request/response handlers (`controllers/`).
- **Services**: Business rules, geocoding fallback, date math, pricing engine (`services/`).
- **Repositories**: Database access abstraction with `.lean()` queries and projections (`repositories/`).
- **Models**: Mongoose schemas with geospatial and text indexes (`models/`).

### 2. Transactional Booking & Double-Booking Protection
- **Collision Protection**: Prevents double-booking overlaps (`checkIn < newCheckOut && checkOut > newCheckIn`).
- **Itemized Pricing Engine**: Live calculation of nights, cleaning fee, service fee, and 18% GST.
- **My Trips Dashboard (`/trips`)**: Complete reservation management with cancellation flows.
- **Checkout & Payment System (`/listings/:id/checkout`)**: Multi-method checkout (Card, UPI, Netbanking).

### 3. Identity, Roles & Wishlists
- **Role-Based Access Control (RBAC)**: Support for `guest`, `host`, and `admin`.
- **Wishlist System (`/wishlist`)**: Save favorite stays with real-time heart buttons.
- **User Profile Dashboard (`/profile`)**: Manage hosted listings, bio, and contact details.

### 4. Search & Category Discovery
- **Interactive Horizontal Filter Bar**: Filter by categories (`trending`, `rooms`, `mountains`, `castles`, `pools`, `camping`, `farms`, `arctic`).
- **Faceted Search**: Substring and full-text keyword search across stay titles, locations, and countries.
- **Live Ratings**: Review aggregation with verified stay tags.

### 5. Host & Admin Operations
- **Host Hub (`/host/dashboard`)**: Earnings metrics, total nights hosted, active properties, and incoming guest reservations.
- **Admin Portal (`/admin`)**: System-wide GMV, user role governance, listing moderation, and tamper-evident audit logs (`models/auditLog.js`).

### 6. Security & Observability
- **Security Hardening**: `helmet` headers, `express-mongo-sanitize` (NoSQL injection prevention), `hpp` (parameter pollution protection), and `express-rate-limit`.
- **Structured Logging (`config/logger.js`)**: Pino JSON logger with distributed request tracing (`x-request-id`) and automatic secret redaction.
- **Health & Readiness Probes**: `GET /health` (liveness) and `GET /ready` (database connectivity).

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Runtime & Framework** | Node.js (>=24), Express 5 |
| **Database** | MongoDB Atlas, Mongoose 9 |
| **Authentication** | Passport.js (Local Strategy, Encrypted Sessions with `connect-mongo`) |
| **Logging & Monitoring** | Pino, Pino-HTTP, Request Tracing |
| **Security** | Helmet, Express-Rate-Limit, Express-Mongo-Sanitize, HPP |
| **Cloud Services** | Cloudinary (Image storage), Mapbox GL JS & Geocoding SDK |
| **UI & Styling** | Bootstrap 5.3, Font Awesome 6.5, Plus Jakarta Sans, Starability Rating |
| **DevOps & Testing** | Docker, Docker Compose, GitHub Actions CI, Node Test Runner |

---

## ⚙️ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/your-repo/wanderlust.git
cd wanderlust
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
# or start production server
npm start
```

### 5. Run Automated Tests
```bash
npm test
```

---

## 🐳 Docker Deployment

Run the complete multi-container stack (App + MongoDB + Redis):
```bash
docker-compose up --build
```
The application will be accessible at `http://localhost:8080`.
