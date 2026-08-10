# NEXORA — Mini ERP + CRM Operations Portal

A production-quality full-stack **Mini ERP + CRM Operations Portal** built for wholesale/distribution business operations. The platform manages customer relationships, product inventories, stock movement audit trails, and multi-item sales challans with atomic stock deduction and historical price snapshot protection.

---

## 🚀 Live Deployment & Links

- 🌐 **Live Frontend Application**: **[https://mini-erp-crm-gray.vercel.app/](https://mini-erp-crm-gray.vercel.app/)**
- 📡 **Live Backend API Server**: **[https://mini-erp-crm-puyn.onrender.com/](https://mini-erp-crm-puyn.onrender.com/)**
- 🩺 **Backend Health Check Endpoint**: **[https://mini-erp-crm-puyn.onrender.com/api/health](https://mini-erp-crm-puyn.onrender.com/api/health)**
- 📁 **GitHub Repository**: **[https://github.com/Sachinshekhar82/Mini-ERP-CRM.git](https://github.com/Sachinshekhar82/Mini-ERP-CRM.git)**
- 📬 **Postman Collection**: **[`postman/Mini-ERP-CRM.postman_collection.json`](file:///C:/Users/hp/.gemini/antigravity/scratch/mini-erp-crm/postman/Mini-ERP-CRM.postman_collection.json)**
- 📄 **Documentation PDF**: **[`NEXORA_Mini_ERP_CRM_Documentation.pdf`](file:///C:/Users/hp/.gemini/antigravity/brain/a9636382-265e-403c-adb9-af4f815eee4c/NEXORA_Mini_ERP_CRM_Documentation.pdf)**

---

## 🔑 Demo Access Credentials (All 4 Roles)

All accounts are pre-seeded in the live Neon PostgreSQL cloud database with password `password123`:

| Role | Email Address | Password | Permissions & Role Scope |
| :--- | :--- | :--- | :--- |
| **👑 ADMIN** | `admin@company.com` | `password123` | Full system access + User Account Management (`/users`) |
| **💼 SALES** | `sales@company.com` | `password123` | Customer CRM, follow-up timeline notes, sales challan creation |
| **📦 WAREHOUSE** | `warehouse@company.com` | `password123` | Product catalog management, manual Stock IN/OUT adjustments, audit logs |
| **📊 ACCOUNTS** | `accounts@company.com` | `password123` | Financial audit, challan viewing/confirmation, PDF invoice export |

---

## 📋 Table of Contents
1. [Live Deployment & Links](#-live-deployment--links)
2. [Demo Access Credentials](#-demo-access-credentials-all-4-roles)
3. [Project Overview](#1-project-overview)
4. [Business Problem](#2-business-problem)
5. [Features](#3-features)
6. [User Roles & Permissions](#4-user-roles--permissions)
7. [Technology Stack](#5-technology-stack)
8. [System Architecture](#6-system-architecture)
9. [Architecture Diagram](#7-architecture-diagram)
10. [Folder Structure](#8-folder-structure)
11. [Database Design](#9-database-design)
12. [Business Logic](#10-business-logic)
13. [Challan Confirmation Flow](#11-challan-confirmation-flow)
14. [API Documentation](#12-api-documentation)
15. [Authentication](#13-authentication)
16. [Environment Variables](#14-environment-variables)
17. [Local Setup](#15-local-setup)
18. [PostgreSQL Setup](#16-postgresql-setup)
19. [Prisma Migration](#17-prisma-migration)
20. [Seed Database](#18-seed-database)
21. [Start Backend](#19-start-backend)
22. [Start Frontend](#20-start-frontend)
23. [Postman Collection](#21-postman-collection)
24. [Deployment Guide](#22-deployment-guide)
25. [Security Considerations](#23-security-considerations)
26. [Known Limitations](#24-known-limitations)
27. [Future Improvements](#25-future-improvements)

---

## 1. Project Overview
**NEXORA** provides an integrated B2B operations suite for wholesale distributors to eliminate manual spreadsheet tracking, prevent inventory stockouts, track customer follow-up histories, and issue formal sales challans with atomic stock deduction guarantees.

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
- **Instant Operations Dashboard**: Real-time KPI cards, low-stock alert lists, localized skeleton loaders, and frame-0 instant UI shell rendering.

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
- **Frontend**: React 18, TypeScript, Vite, React Router DOM v6, Axios, Lucide React, Custom B2B Design System.
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, Zod, BcryptJS, JSONWebToken, Helmet, Morgan, PDFKit.
- **Database**: PostgreSQL (Neon.tech Cloud Database in Production).
- **API Testing**: Postman Collection (Auto-JWT token capture test scripts).

---

## 6. System Architecture
The application adheres to a decoupled RESTful architecture:
```
┌─────────────────────────────────────────────────────────┐
│           React 18 + Vite SPA (Vercel Host)             │
│      (Protected Routes, Auth Context, Admin UI)         │
└────────────────────────────┬────────────────────────────┘
                             │ Axios HTTP / Bearer JWT
                             ▼
┌─────────────────────────────────────────────────────────┐
│          Express.js REST API (Render Host)              │
│ (Helmet Security, Morgan Logging, Zod, Auth Middleware) │
└────────────────────────────┬────────────────────────────┘
                             │ Prisma Client
                             ▼
┌─────────────────────────────────────────────────────────┐
│          Neon PostgreSQL Cloud Database                 │
│    (Models: User, Customer, Product, SalesChallan...)   │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Architecture Diagram

```mermaid
graph TD
    User([User Browser]) -->|HTTP Requests| ReactApp[React 18 SPA on Vercel]
    ReactApp -->|REST API + Bearer JWT| ExpressServer[Express.js Server on Render]
    ExpressServer -->|Zod Validation| Validators[Request Validators]
    Validators -->|Auth & Role Check| AuthMiddleware[RBAC Middleware]
    AuthMiddleware -->|Service Layer| Services[Business Services]
    Services -->|Prisma $transaction| PrismaORM[Prisma ORM]
    PrismaORM -->|SQL Queries| Database[(Neon Cloud PostgreSQL)]
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
│   │   ├── utils/ (jwt.ts, password.ts, pdfGenerator.ts)
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   └── render.yaml
├── frontend/
│   ├── src/
│   │   ├── components/ (Navbar, Sidebar, Modal, Toast, StatCard, branding/NexoraLogo.tsx)
│   │   ├── context/ (AuthContext.tsx)
│   │   ├── pages/ (Login, Dashboard, Customers, Products, StockLogs, Challans, Profile, Users, NotFound)
│   │   ├── services/ (api.ts)
│   │   ├── types/ (index.ts)
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   ├── vercel.json
│   └── vite.config.ts
├── postman/
│   └── Mini-ERP-CRM.postman_collection.json
├── NEXORA_Mini_ERP_CRM_Documentation.pdf
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
4. **Atomic Rollback Guarantee**: If even 1 product has insufficient stock:
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

### Backend (`backend/.env`):
```env
PORT=5000
NODE_ENV=production
DATABASE_URL="postgresql://neondb_owner:npg_bVodS5HEi6XR@ep-aged-mode-az9ib4ig-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="mini_erp_crm_jwt_secret_key_2026_super_secure"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="https://mini-erp-crm-gray.vercel.app"
```

### Frontend (`frontend/.env`):
```env
VITE_API_URL=https://mini-erp-crm-puyn.onrender.com/api
```

---

## 15. Local Setup
```bash
# Clone Repository
git clone https://github.com/Sachinshekhar82/Mini-ERP-CRM.git
cd Mini-ERP-CRM
```

---

## 16. Start Backend
```bash
cd backend
npm install
npm run dev
```

---

## 17. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 18. Postman Collection
The Postman collection is located at [`postman/Mini-ERP-CRM.postman_collection.json`](file:///C:/Users/hp/.gemini/antigravity/scratch/mini-erp-crm/postman/Mini-ERP-CRM.postman_collection.json). Import into Postman and execute `1. Authentication -> Login` to populate the `{{token}}` variable automatically!

---

## 19. Known Limitations
- Challan cancellation currently applies to `DRAFT` status; returning inventory for `CONFIRMED` orders requires issuing a reverse Stock IN adjustment to maintain audit log integrity.

---

## 20. Submission Checklist
- [x] **GitHub Repository Link**: [https://github.com/Sachinshekhar82/Mini-ERP-CRM.git](https://github.com/Sachinshekhar82/Mini-ERP-CRM.git)
- [x] **Live Frontend Application**: [https://mini-erp-crm-gray.vercel.app/](https://mini-erp-crm-gray.vercel.app/)
- [x] **Live Backend API**: [https://mini-erp-crm-puyn.onrender.com/](https://mini-erp-crm-puyn.onrender.com/)
- [x] **Demo Login Credentials for All Roles**: Pre-seeded in cloud PostgreSQL (`admin@company.com`, `sales@company.com`, `warehouse@company.com`, `accounts@company.com`).
- [x] **Postman Collection**: [`postman/Mini-ERP-CRM.postman_collection.json`](file:///C:/Users/hp/.gemini/antigravity/scratch/mini-erp-crm/postman/Mini-ERP-CRM.postman_collection.json)
- [x] **Documentation PDF**: [`NEXORA_Mini_ERP_CRM_Documentation.pdf`](file:///C:/Users/hp/.gemini/antigravity/brain/a9636382-265e-403c-adb9-af4f815eee4c/NEXORA_Mini_ERP_CRM_Documentation.pdf)
- [x] **Architecture & Performance**: Instant frame-0 UI shell, localized skeletons, and PostgreSQL SQL aggregates.
