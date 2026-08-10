# Mini ERP + CRM Operations Portal

A production-quality full-stack **Mini ERP + CRM Operations Portal** built for a wholesale/distribution business. The platform manages customer relationships, product inventories, stock movement audit trails, and multi-item sales challans with atomic stock deduction and historical price snapshot protection.

[![GitHub Repo](https://img.shields.io/badge/GitHub-Mini--ERP--CRM-blue?logo=github)](https://github.com/Sachinshekhar82/Mini-ERP-CRM.git)
[![Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20React%20%7C%20TypeScript%20%7C%20Prisma-indigo)]()
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)]()

---

## 📋 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Business Problem](#2-business-problem)
3. [Features](#3-features)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [Technology Stack](#5-technology-stack)
6. [System Architecture](#6-system-architecture)
7. [Architecture Diagram](#7-architecture-diagram)
8. [Folder Structure](#8-folder-structure)
9. [Database Design](#9-database-design)
10. [Business Logic](#10-business-logic)
11. [Challan Confirmation Flow](#11-challan-confirmation-flow)
12. [API Documentation](#12-api-documentation)
13. [Authentication](#13-authentication)
14. [Environment Variables](#14-environment-variables)
15. [Local Setup](#15-local-setup)
16. [PostgreSQL Setup](#16-postgresql-setup)
17. [Prisma Migration](#17-prisma-migration)
18. [Seed Database](#18-seed-database)
19. [Start Backend](#19-start-backend)
20. [Start Frontend](#20-start-frontend)
21. [Demo Credentials](#21-demo-credentials)
22. [Postman Collection](#22-postman-collection)
23. [Deployment Guide](#23-deployment-guide)
24. [Frontend Deployment](#24-frontend-deployment)
25. [Backend Deployment](#25-backend-deployment)
26. [Database Deployment](#26-database-deployment)
27. [Security Considerations](#27-security-considerations)
28. [Assumptions](#28-assumptions)
29. [Known Limitations](#29-known-limitations)
30. [Future Improvements](#30-future-improvements)
31. [Screenshots](#31-screenshots)
32. [Submission Checklist](#32-submission-checklist)

---

## 1. Project Overview
The **Mini ERP + CRM Operations Portal** provides an integrated operations suite for wholesale distributors to eliminate manual spreadsheet tracking, prevent inventory stockouts, track customer follow-up histories, and issue formal sales challans with atomic stock deduction guarantees.

---

## 2. Business Problem
Wholesale distributors frequently face operational risks:
- **Corrupted Historical Invoices**: When catalog prices change, old quotes or invoices mistakenly recalculate at current prices.
- **Negative Stock & Over-selling**: Sales reps issue challans for products out of stock, leading to delayed orders and unfulfilled commitments.
- **Partial Confirmation Vulnerabilities**: Incomplete transactions where 1 product is deducted but another fails, leaving inventory in an inconsistent state.
- **Unverified Role Actions**: Non-authorized staff modifying inventory counts or deleting customer records.

---

## 3. Features
- **JWT & Role-Based Authorization**: Enforces 4 distinct internal roles (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`).
- **Customer CRM**: Multi-field search (name, business, email, phone, GSTIN), filters, pagination, and a **chronological follow-up timeline** storing notes separately.
- **Product & Inventory Management**: Catalog search, low-stock threshold alerts (`currentStock <= minimumStock`), unique SKU validation, and safe update rules stripping arbitrary stock edits.
- **Stock Movement Audit Trail**: Manual Stock IN / Stock OUT forms with atomic `prisma.$transaction()` tracking and reason logs.
- **Sales Challans & PDF Invoices**: Product snapshot fields (`productNameSnapshot`, `skuSnapshot`, `unitPriceSnapshot`), dynamic line items, auto-generated numbers (`CH-2026-XXXX`), and instant PDF downloads.
- **Atomic Stock Deduction**: Single-transaction multi-item stock check; if **any** product lacks stock, the entire transaction rolls back cleanly.
- **Operations Dashboard**: Real-time KPI cards, low-stock alert lists, and recent activity feeds.

---

## 4. User Roles & Permissions

| Role | Access Permissions |
| :--- | :--- |
| **👑 ADMIN** | Full administrative access to all modules, system configuration, and User Account Management (`/users`). |
| **💼 SALES** | Customer CRM, follow-up notes, sales challan creation/confirmation, product catalog reading. |
| **📦 WAREHOUSE** | Product catalog management, manual stock IN/OUT adjustments, stock movement audit logs, challan reading. |
| **📊 ACCOUNTS** | Customer reading, product reading, sales challan viewing, draft confirmation, PDF invoice download, dashboard reports. |

---

## 5. Technology Stack
- **Frontend**: React 18, TypeScript, Vite, React Router DOM v6, Axios, Lucide React, Vanilla CSS Tokens.
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, Zod, BcryptJS, JSONWebToken, Helmet, Morgan, PDFKit.
- **Database**: PostgreSQL (Production) / SQLite (Development zero-config).
- **API Testing**: Postman Collection (Collection variables & auto-JWT capture scripts).

---

## 6. System Architecture
The application adheres to a decoupled RESTful architecture:
```
┌─────────────────────────────────────────────────────────┐
│              React 18 + Vite Frontend App               │
│      (Protected Routes, Auth Context, Admin UI)         │
└────────────────────────────┬────────────────────────────┘
                             │ Axios HTTP / JWT Bearer
                             ▼
┌─────────────────────────────────────────────────────────┐
│               Express.js REST API Server                │
│ (Helmet Security, Morgan Logging, Zod, Auth Middleware) │
└────────────────────────────┬────────────────────────────┘
                             │ Prisma Client
                             ▼
┌─────────────────────────────────────────────────────────┐
│             PostgreSQL / SQLite Database                │
│    (Models: User, Customer, Product, SalesChallan...)   │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Architecture Diagram

```mermaid
graph TD
    User([User Browser]) -->|HTTP Requests| ReactApp[React 18 SPA]
    ReactApp -->|REST API + Bearer JWT| ExpressServer[Express.js Server]
    ExpressServer -->|Zod Validation| Validators[Request Validators]
    Validators -->|Auth & Role Check| AuthMiddleware[RBAC Middleware]
    AuthMiddleware -->|Service Layer| Services[Business Services]
    Services -->|Prisma $transaction| PrismaORM[Prisma ORM]
    PrismaORM -->|SQL Queries| Database[(PostgreSQL DB)]
```

---

## 8. Folder Structure
```
mini-erp-crm/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/ (env.ts, prisma.ts)
│   │   ├── controllers/ (auth, customer, product, inventory, challan, dashboard)
│   │   ├── middleware/ (auth, errorHandler, validate)
│   │   ├── routes/ (auth, users, customers, products, stock, challans, dashboard)
│   │   ├── services/ (auth, customer, product, inventory, challan, dashboard)
│   │   ├── types/ (auth.ts)
│   │   ├── utils/ (jwt.ts, password.ts, pdfGenerator.ts)
│   │   ├── validators/ (auth, customer, product, inventory, challan)
│   │   ├── app.ts
│   │   ├── server.ts
│   │   └── testMasterE2E.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/ (Navbar, Sidebar, Modal, Toast, StatCard)
│   │   ├── context/ (AuthContext.tsx)
│   │   ├── pages/ (Login, Dashboard, Customers, Products, StockLogs, Challans, Profile, Users, NotFound)
│   │   ├── services/ (api.ts)
│   │   ├── types/ (index.ts)
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── postman/
│   └── Mini-ERP-CRM.postman_collection.json
└── README.md
```

---

## 9. Database Design

### Key Models:
- **`User`**: `id`, `name`, `email` (unique), `password`, `role` (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`).
- **`Customer`**: `id`, `customerName`, `mobile`, `email`, `businessName`, `gstNumber`, `customerType`, `address`, `status`, `followUpDate`, `notes`.
- **`CustomerFollowUp`**: `id`, `customerId`, `note`, `createdById`, `createdAt` *(Cascade delete)*.
- **`Product`**: `id`, `productName`, `sku` (unique), `category`, `unitPrice`, `currentStock`, `minimumStock`, `warehouseLocation`.
- **`StockMovement`**: `id`, `productId`, `quantityChanged`, `movementType` (`IN`, `OUT`), `reason`, `createdById`, `createdAt`.
- **`SalesChallan`**: `id`, `challanNumber` (unique), `customerId`, `totalQuantity`, `totalAmount`, `status` (`DRAFT`, `CONFIRMED`, `CANCELLED`), `notes`, `createdById`.
- **`SalesChallanItem`**: `id`, `challanId`, `productId`, `productNameSnapshot`, `skuSnapshot`, `unitPriceSnapshot`, `quantity`, `totalPrice`.

---

## 10. Business Logic
1. **Product Price & Name Snapshot**: `SalesChallanItem` copies `productNameSnapshot`, `skuSnapshot`, and `unitPriceSnapshot` upon creation. Future catalog edits will never corrupt historical quotes.
2. **Safe Product Edits**: `PUT /api/products/:id` strips direct `currentStock` mutations. Stock levels must be modified through audited stock-in, stock-out, or challan confirmation flows.
3. **Separate Follow-up Timeline**: Customer follow-up notes are saved as individual relational records (`CustomerFollowUp`), leaving original registration notes intact.

---

## 11. Challan Confirmation Flow

When `POST /api/challans/:id/confirm` is invoked:
1. Opens a single `prisma.$transaction()` block.
2. Reads the challan, customer, and all line item requested quantities.
3. Performs a stock pre-verification check for **every line item**.
4. **Atomic Rollback Guarantee**: If even 1 product has insufficient stock (e.g. Product A = 5 available/requested 2, Product B = 1 available/requested 5):
   - ❌ Transaction aborts and rolls back completely.
   - ❌ **0 stock is reduced**.
   - ❌ **0 `StockMovement` logs are created**.
   - ❌ Challan remains in **`DRAFT`** status.
   - ❌ Returns **HTTP 400 Bad Request** explaining the exact missing item.
5. If all items pass, stock is reduced, `OUT` audit logs are created, status becomes **`CONFIRMED`**, and the transaction commits.

---

## 12. API Documentation

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates credentials, returns JWT & user profile. |
| `GET` | `/api/auth/me` | All Roles | Returns logged-in user profile. |
| `GET` | `/api/users` | Admin Only | Lists employee user accounts. |
| `POST` | `/api/users` | Admin Only | Creates new employee account with assigned role. |
| `GET` | `/api/customers` | Admin, Sales, Accounts | Lists customers with search, status/type filters, and pagination. |
| `POST` | `/api/customers` | Admin, Sales | Adds new customer (checks duplicate email/mobile). |
| `GET` | `/api/customers/:id` | Admin, Sales, Accounts | Customer profile with follow-up timeline & sales history. |
| `POST` | `/api/customers/:id/follow-ups` | Admin, Sales | Appends a follow-up note to customer timeline. |
| `GET` | `/api/products` | All Roles | Catalog search, low stock alert filter (`lowStock=true`). |
| `POST` | `/api/products` | Admin, Warehouse | Adds product with initial stock movement log. |
| `POST` | `/api/inventory/stock-in` | Admin, Warehouse | Atomic stock increment & `IN` movement log. |
| `POST` | `/api/inventory/stock-out` | Admin, Warehouse | Atomic stock reduction & `OUT` movement log. |
| `GET` | `/api/inventory/movements` | Admin, Warehouse | System-wide stock movement audit log trail. |
| `POST` | `/api/challans` | Admin, Sales | Generates draft sales challan with snapshot fields. |
| `POST` | `/api/challans/:id/confirm` | Admin, Sales, Accounts | Atomic confirmation & stock deduction. |
| `GET` | `/api/challans/:id/pdf` | All Roles | Generates printable PDF invoice. |
| `GET` | `/api/dashboard/stats` | All Roles | Real-time KPI metrics and activity feeds. |

---

## 13. Authentication
Authentication is powered by JWT bearer tokens stored in `localStorage`. Requests transmit `Authorization: Bearer <token>`.
- Missing/invalid tokens return **HTTP 401 Unauthenticated**.
- Role guard failures return **HTTP 403 Forbidden**.

---

## 14. Environment Variables

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="mini_erp_crm_jwt_secret_key_2026_super_secure"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="*"
```

---

## 15. Local Setup
```bash
# Clone Repository
git clone https://github.com/Sachinshekhar82/Mini-ERP-CRM.git
cd Mini-ERP-CRM
```

---

## 16. PostgreSQL Setup
To switch to PostgreSQL in production, set `DATABASE_URL` in `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/minierpcrm?schema=public"
```
Update `backend/prisma/schema.prisma` datasource provider to `provider = "postgresql"`.

---

## 17. Prisma Migration
```bash
cd backend
npx prisma db push
```

---

## 18. Seed Database
Populate 4 user roles, 10 customers, 15 products, stock logs, and sales challans:
```bash
cd backend
npm run seed
```

---

## 19. Start Backend
```bash
cd backend
# Development mode
npm run dev

# Production build & start
npm run build
npm start
```
Server runs at `http://localhost:5000`.

---

## 20. Start Frontend
```bash
cd frontend
# Development mode
npm run dev

# Production build
npm run build
```
Frontend runs at `http://localhost:3000`.

---

## 21. Demo Credentials

| Role | Email Address | Password |
| :--- | :--- | :--- |
| **👑 Admin** | `admin@company.com` | `password123` |
| **💼 Sales** | `sales@company.com` | `password123` |
| **📦 Warehouse** | `warehouse@company.com` | `password123` |
| **📊 Accounts** | `accounts@company.com` | `password123` |

---

## 22. Postman Collection
The Postman collection is located at [`postman/Mini-ERP-CRM.postman_collection.json`](file:///C:/Users/hp/.gemini/antigravity/scratch/mini-erp-crm/postman/Mini-ERP-CRM.postman_collection.json).
Import into Postman and execute `1. Authentication -> Login (Admin Role)` to automatically populate the `{{token}}` variable!

---

## 23. Deployment Guide
Recommended cloud platforms: Render, Railway, Vercel, AWS App Runner.

---

## 24. Frontend Deployment
Deploy `frontend/` to **Vercel** or **Netlify**:
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables: `VITE_API_BASE_URL=https://your-backend-domain.com/api`

---

## 25. Backend Deployment
Deploy `backend/` to **Render** or **Railway**:
- Build Command: `npm run build`
- Start Command: `npm start`
- Environment Variables: Set `DATABASE_URL`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN`.

---

## 26. Database Deployment
Deploy PostgreSQL database on **Neon.tech**, **Supabase**, or **Render PostgreSQL**:
- Copy database connection string into `DATABASE_URL`.
- Execute `npx prisma db push` and `npm run seed`.

---

## 27. Security Considerations
- **Helmet Security**: Protected HTTP headers (`crossOriginResourcePolicy: false`).
- **No Password Exposure**: Password hashes are stripped before returning user responses.
- **Strict Input Validation**: Zod schema validation on all POST/PUT bodies.
- **Single Source of Truth**: Backend RBAC middleware independently verifies permissions regardless of frontend state.

---

## 28. Assumptions
- Business operates in INR currency (₹).
- Standard GSTIN numbers consist of 15 alphanumeric characters.

---

## 29. Known Limitations
- Challan cancellation currently applies to `DRAFT` status; returning inventory for `CONFIRMED` orders requires issuing a reverse Stock IN adjustment.

---

## 30. Future Improvements
- Multi-currency support.
- Automated email dispatch of PDF invoices directly to customer email addresses.
- Multi-warehouse location routing.

---

## 31. Screenshots
*(Add application dashboard and challan invoice screenshots here)*

---

## 32. Submission Checklist
- [x] Decoupled backend REST API & React frontend.
- [x] Complete Prisma PostgreSQL/SQLite schema with snapshot fields.
- [x] Bcrypt password hashing & JWT authentication.
- [x] 4 distinct role permissions (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`).
- [x] Customer CRM with separate follow-up timeline notes.
- [x] Product catalog & low stock warning alerts (`currentStock <= minimumStock`).
- [x] Stock IN & Stock OUT manual adjustment forms with movement audit logs.
- [x] Sales challans with product snapshot protection.
- [x] Multi-item atomic stock deduction transaction (`prisma.$transaction`).
- [x] Postman collection with auto-JWT capture scripts.
- [x] Clean GitHub repository with detailed documentation.
