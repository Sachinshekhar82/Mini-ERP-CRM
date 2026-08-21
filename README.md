# NEXORA — Mini Operations ERP + CRM Portal

A production-quality full-stack **Mini Operations ERP + CRM Portal** built for multi-location wholesale and distribution operations. The platform manages multi-location inventory, automatic material shortage checks for work orders, 2-phase internal stock transfers, customer order stock reservations, and multi-item sales challans with atomic stock deduction and historical price snapshot protection.

---

## 🚀 Live Deployment & Links

- 🌐 **Live Frontend Application**: **[https://mini-erp-crm-gray.vercel.app/](https://mini-erp-crm-gray.vercel.app/)**
- 📡 **Live Backend API Server**: **[https://mini-erp-crm-puyn.onrender.com/](https://mini-erp-crm-puyn.onrender.com/)**
- 🩺 **Backend Health Check Endpoint**: **[https://mini-erp-crm-puyn.onrender.com/api/health](https://mini-erp-crm-puyn.onrender.com/api/health)**
- 📁 **GitHub Repository**: **[https://github.com/Sachinshekhar82/Mini-ERP-CRM.git](https://github.com/Sachinshekhar82/Mini-ERP-CRM.git)**
- 📬 **Postman Collection**: **[`postman/Mini-ERP-CRM.postman_collection.json`](file:///C:/Users/hp/.gemini/antigravity/scratch/mini-erp-crm/postman/Mini-ERP-CRM.postman_collection.json)**
- 📄 **Documentation PDF**: **[`NEXORA_Mini_ERP_CRM_Documentation.pdf`](file:///C:/Users/hp/.gemini/antigravity/brain/a9636382-265e-403c-adb9-af4f815eee4c/NEXORA_Mini_ERP_CRM_Documentation.pdf)**

---

## 🔑 Demo Access Credentials (All 5 Roles)

All accounts are pre-seeded in the live Neon PostgreSQL cloud database with password `password123`:

| Role | Email Address | Password | Permissions & Role Scope |
| :--- | :--- | :--- | :--- |
| **👑 ADMIN** | `admin@company.com` | `password123` | Full system access + Work Order creation + User Administration |
| **⚙️ OPERATIONS** | `ops@company.com` | `password123` | Multi-location inventory management & 2-phase stock transfers |
| **💼 SALES** | `sales@company.com` | `password123` | Customer CRM, Customer Orders, and Stock Reservations |
| **📦 WAREHOUSE** | `warehouse@company.com` | `password123` | Product catalog management, manual Stock IN/OUT adjustments, audit logs |
| **📊 ACCOUNTS** | `accounts@company.com` | `password123` | Financial audit, challan viewing/confirmation, PDF invoice export |

---

## 🆕 Summary of Recent Technical Case Study Upgrades

1. **Multi-Location Inventory & Batches**:
   - Location A (Warehouse Main) and Location B (Branch Depot) inventory tracking.
   - Batch / Lot tracking with SKU uniqueness constraints.
   - **Calculated Available Stock**: `Available Quantity = Physical Quantity - Reserved Quantity`. Prevents negative inventory or over-allocation.
2. **Work Orders & Material Stock Check**:
   - Admin Work Order creation (`WO-2026-XXXX`).
   - **Automatic Shortage Calculation**: `Shortage Quantity = Math.max(0, Required Quantity - Available Quantity)`.
   - Status lifecycle (`ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `COMPLETED`).
3. **Internal Stock Transfers (2-Phase Workflow)**:
   - Status transitions (`REQUESTED` $\rightarrow$ `DISPATCHED` $\rightarrow$ `RECEIVED`).
   - On **Dispatch**, source physical inventory reduces.
   - Before **Receipt**, destination inventory **does NOT increase**.
   - On **Receipt**, destination inventory increases.
   - **Double-Receive Protection**: Prevents receiving the same transfer twice.
4. **Customer Orders & Stock Reservation**:
   - Sales user order creation with atomic stock reservation.
   - Atomic `prisma.$transaction()` **concurrency protection** prevents two simultaneous users from reserving more stock than exists.
5. **Mandatory Automated Test Suite (11/11 Passed)**:
   - Test 1: Cannot reserve more than available inventory.
   - Test 2: Cannot transfer more than available inventory.
   - Test 3: Destination stock increases ONLY after transfer receipt.
   - Test 4: Same transfer cannot be received twice.
   - Test 5: Unauthorized user cannot perform restricted operation.

---

## 🧪 Automated Test Suite Execution Results

Ran `npx ts-node src/testMandatorySuite.ts` against live **Neon PostgreSQL**:

```text
================================================================
🧪 MANDATORY TECHNICAL CASE STUDY TEST SUITE (PostgreSQL)
================================================================

--- TEST 1: Cannot reserve more than available inventory ---
  ✅ PASSED: Over-reservation rejected with HTTP 400 Insufficient Available Inventory
  ✅ PASSED: Physical, Reserved & Available stock remain untouched

--- TEST 2: Cannot transfer more than available inventory ---
  ✅ PASSED: Over-transfer rejected with HTTP 400 Insufficient Stock

--- TEST 3: Destination stock increases ONLY after transfer receipt ---
  ✅ PASSED: Transfer status updated to DISPATCHED
  ✅ PASSED: Source stock reduced to 10 on dispatch
  ✅ PASSED: Destination stock did NOT increase before receipt
  ✅ PASSED: Transfer status updated to RECEIVED
  ✅ PASSED: Destination stock increased to 10 ONLY after transfer receipt

--- TEST 4: Same transfer cannot be received twice ---
  ✅ PASSED: Duplicate receipt rejected with HTTP 400 Transfer Already Received
  ✅ PASSED: Destination stock remains exactly 10 (0 duplicate addition)

--- TEST 5: Unauthorized user cannot perform restricted operation ---
  ✅ PASSED: Unauthorized user action rejected with HTTP 403 Forbidden

================================================================
🎉 MANDATORY CASE STUDY SUITE SUMMARY: 11 PASSED, 0 FAILED.
================================================================
```

---

## 📋 Table of Contents
1. [Live Deployment & Links](#-live-deployment--links)
2. [Demo Access Credentials](#-demo-access-credentials-all-5-roles)
3. [Summary of Recent Technical Case Study Upgrades](#-summary-of-recent-technical-case-study-upgrades)
4. [Automated Test Suite Execution Results](#-automated-test-suite-execution-results)
5. [System Architecture](#5-system-architecture)
6. [Folder Structure](#6-folder-structure)
7. [Database Design & Prisma Models](#7-database-design--prisma-models)
8. [API Documentation](#8-api-documentation)
9. [Local Setup & Running Instructions](#9-local-setup--running-instructions)

---

## 5. System Architecture
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
│    (Models: User, InventoryItem, WorkOrder, Transfer)   │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Folder Structure
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
│   │   ├── routes/ (auth, users, customers, products, stock, challans, inventoryItems, workOrders, transfers, customerOrders)
│   │   ├── services/ (auth, customer, product, inventoryItem, workOrder, internalTransfer, customerOrder)
│   │   ├── testMandatorySuite.ts
│   │   ├── generateDocPdf.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   └── render.yaml
├── frontend/
│   ├── src/
│   │   ├── components/ (Navbar, Sidebar, Modal, Toast, StatCard, branding/NexoraLogo.tsx)
│   │   ├── context/ (AuthContext.tsx)
│   │   ├── pages/ (Login, Dashboard, InventoryItems, WorkOrders, InternalTransfers, CustomerOrders, Customers, Products, StockLogs, Challans, Profile, Users, NotFound)
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

## 7. Database Design & Prisma Models

- **`User`**: `id`, `name`, `email` (unique), `password`, `role` (`ADMIN`, `OPERATIONS`, `SALES`, `WAREHOUSE`, `ACCOUNTS`).
- **`InventoryItem`**: `id`, `itemName`, `sku`, `category`, `location`, `batch`, `physicalQty`, `reservedQty`, `availableQty`, `unitPrice`.
- **`WorkOrder`**: `id`, `workOrderNumber` (unique), `location`, `inventoryItemId`, `requiredQty`, `shortageQty`, `assignedUserId`, `status` (`ASSIGNED`, `IN_PROGRESS`, `COMPLETED`).
- **`InternalTransfer`**: `id`, `transferNumber` (unique), `sourceLocation`, `destinationLocation`, `inventoryItemId`, `quantity`, `status` (`REQUESTED`, `DISPATCHED`, `RECEIVED`).
- **`CustomerOrder`**: `id`, `orderNumber` (unique), `customerName`, `inventoryItemId`, `quantity`, `status` (`PENDING`, `RESERVED`, `COMPLETED`, `CANCELLED`).

---

## 8. API Documentation

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates credentials, returns JWT & user profile. |
| `GET` | `/api/inventory-items` | All Roles | Lists multi-location inventory with physical, reserved, available stock. |
| `POST` | `/api/inventory-items` | Admin, Operations, Warehouse | Creates new inventory item record. |
| `GET` | `/api/work-orders` | All Roles | Lists work orders with calculated shortage quantities. |
| `POST` | `/api/work-orders` | Admin Only | Creates work order and auto-calculates shortage. |
| `PATCH` | `/api/work-orders/:id/status` | Admin, Operations | Updates work order status (`IN_PROGRESS`, `COMPLETED`). |
| `GET` | `/api/transfers` | All Roles | Lists internal stock transfers. |
| `POST` | `/api/transfers` | Admin, Operations | Requests internal stock transfer. |
| `POST` | `/api/transfers/:id/dispatch` | Admin, Operations | Dispatches transfer (Reduces source stock). |
| `POST` | `/api/transfers/:id/receive` | Admin, Operations | Receives transfer (Increases destination stock; double-receive protected). |
| `GET` | `/api/customer-orders` | All Roles | Lists customer orders and stock reservations. |
| `POST` | `/api/customer-orders` | Admin, Sales | Creates order & reserves stock atomically. |
| `POST` | `/api/customer-orders/:id/cancel` | Admin, Sales | Cancels order & releases reserved stock. |

---

## 9. Local Setup & Running Instructions

```bash
# Clone Repository
git clone https://github.com/Sachinshekhar82/Mini-ERP-CRM.git
cd Mini-ERP-CRM

# Backend Setup
cd backend
npm install
npx prisma db push
npm run seed
npm run dev

# Run Mandatory Test Suite
npx ts-node src/testMandatorySuite.ts

# Frontend Setup (in new terminal)
cd frontend
npm install
npm run dev
```
