# Mini ERP + CRM Operations Portal

> **Full Stack Developer Case Study Assignment**  
> A complete, production-grade Mini ERP & Customer CRM System for wholesale and distribution enterprises. Built with Node.js, Express, TypeScript, Prisma ORM, React 18, Vite, Lucide Icons, and styled with a modern dark glassmorphism aesthetic.

---

## 🔗 Repository & Live Deployment Links

- **GitHub Repository**: [https://github.com/Sachinshekhar82/Mini-ERP-CRM.git](https://github.com/Sachinshekhar82/Mini-ERP-CRM.git)
- **Live Frontend (Vercel)**: `https://mini-erp-crm-frontend.vercel.app` *(Optional deployment)*
- **Live Backend API (Render)**: `https://mini-erp-crm-api.onrender.com` *(Optional deployment)*

---

## 🔑 Test Login Credentials (Role-Based Access Control)

The database includes an automatic seed script with pre-configured accounts for all **4 required roles**. All passwords are set to `password123`.

| Role | Email Address | Password | Permissions & Capabilities |
| :--- | :--- | :--- | :--- |
| 👑 **Admin** | `admin@company.com` | `password123` | Full access across all modules (Customers, Products, Stock Adjustments, Sales Challans). |
| 💼 **Sales** | `sales@company.com` | `password123` | Customer CRM management, adding follow-up notes, generating & confirming Sales Challans. |
| 📦 **Warehouse** | `warehouse@company.com` | `password123` | Inventory management, product adding/editing, stock level alerts, logging manual stock IN/OUT. |
| 📊 **Accounts** | `accounts@company.com` | `password123` | View customer records, view sales challans, confirm draft challans, download PDF invoices. |

> 💡 *Note: The login page includes a **1-click Quick Login Bar** so you can instantly log in as any role without typing!*

---

## 🚀 Key Modules & Business Logic Highlights

### 1. Authentication & RBAC Module
- **JWT-Based Authentication**: Secure token generation with bcrypt password hashing (`bcryptjs`).
- **Role Guards**: Backend API middleware (`requireRole('ADMIN', 'SALES')`) ensuring strict endpoint authorization.

### 2. Customer CRM Module
- **Customer Fields**: Name, Mobile, Email, Business Name, GSTIN (optional), Type (`Retail`, `Wholesale`, `Distributor`), Address, Status (`Lead`, `Active`, `Inactive`), Follow-up Date, Notes.
- **Search & Filtering**: Search by name, business, email, phone number + filter by status or customer type.
- **CRM Timeline**: Add follow-up notes to track customer interaction history.

### 3. Product & Inventory Module
- **Product Fields**: Product Name, SKU/Code, Category, Unit Price, Current Stock, Minimum Stock Alert Qty, Warehouse Location, Image URL.
- **Stock Alert System**: Real-time warnings & badges when `currentStock <= minStockAlert`.
- **Stock Movement Log Audit**: Complete tracking table recording Product, Qty Changed, Movement Type (`IN` / `OUT`), Reason (PO receive, sales challan, return), Created By user, and Timestamp.

### 4. Sales Challan Module & Crucial Business Rules
- **Automatic Numbering**: Auto-generated sequential challan numbers (`CH-YYYY-XXXX`).
- **Snapshot Data Protection**: Challans store a **snapshot of product name, SKU, and unit price** at the moment of creation. If product prices or names change in the catalog later, historical sales challans remain 100% intact.
- **Atomic Stock Deduction**: When a Challan status changes to `CONFIRMED`, current stock is reduced automatically and an `OUT` Stock Movement Log is created in a database transaction.
- **Negative Stock Prevention**: Stock validation checks prevent confirmation if stock is insufficient. The API throws an HTTP 400 error (`Insufficient stock for product X. Available: Y, Requested: Z`).
- **PDF Invoice Export**: Integrated PDF generator (`pdfkit`) producing official, printable PDF tax invoices with 1 click!

---

## 📁 Repository Structure

```
Mini-ERP-CRM/
├── backend/                  # Node.js + Express + TypeScript API Server
│   ├── prisma/
│   │   ├── schema.prisma     # Prisma ORM Schema (SQLite local zero-config / Postgres compatible)
│   │   └── seed.ts           # Automatic database seed script with test accounts & demo data
│   ├── src/
│   │   ├── config/           # Prisma client singleton
│   │   ├── controllers/      # API Controllers
│   │   ├── middleware/       # JWT Auth, Role Guard, Zod Validation, Error Handler
│   │   ├── routes/           # REST Router modules (auth, customers, products, stock, challans, dashboard)
│   │   ├── utils/            # PDFKit Invoice builder
│   │   └── index.ts          # Express application entry point
│   ├── Dockerfile            # Container image builder for backend
│   └── package.json
├── frontend/                 # React 18 + Vite + TypeScript Single Page App
│   ├── src/
│   │   ├── components/       # Reusable UI (Sidebar, Navbar, Modal, StatCard, Toast)
│   │   ├── context/          # Auth Context & JWT Session state
│   │   ├── pages/            # Login, Dashboard, Customers, Products, StockLogs, Challans
│   │   ├── services/         # Axios API Client
│   │   ├── types/            # TypeScript interfaces
│   │   └── App.tsx           # React Router DOM configuration
│   ├── Dockerfile            # Production Nginx SPA Docker builder
│   └── package.json
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions CI workflow for linting & build verification
├── docker-compose.yml        # Orchestration for Backend + Frontend + PostgreSQL
├── postman_collection.json   # Exported Postman collection for API testing
└── README.md                 # Complete documentation
```

---

## 🛠️ Step-by-Step Local Setup Instructions

### Prerequisites
- Node.js `v18.x` or `v20.x` installed
- Git installed

### 1. Clone the Repository
```bash
git clone https://github.com/Sachinshekhar82/Mini-ERP-CRM.git
cd Mini-ERP-CRM
```

### 2. Backend Setup & Database Seeding
```bash
cd backend
npm install

# Push database schema & seed sample accounts
npx prisma db push
npm run seed

# Start development server (runs on http://localhost:5000)
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install

# Start Vite React server (runs on http://localhost:3000)
npm run dev
```

Open your browser and navigate to **`http://localhost:3000`**. Use any of the Quick Login buttons on the login page!

---

## ⚙️ Environment Variables Configuration

### Backend `.env` File
Located at `backend/.env`:
```env
PORT=5000
DATABASE_URL="file:./dev.db" # SQLite local database (Change to postgresql:// for Cloud DB)
JWT_SECRET="mini_erp_crm_jwt_secret_key_2026_super_secure"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"

# Optional AWS S3 Credentials (for cloud image storage)
AWS_ACCESS_KEY_ID="your_key"
AWS_SECRET_ACCESS_KEY="your_secret"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="mini-erp-crm-uploads"
```

---

## 🐳 Running with Docker & Docker Compose

To spin up the entire application (PostgreSQL + Backend API + Frontend Nginx) using Docker:

```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- PostgreSQL Database: `localhost:5432`

---

## 📡 REST API Endpoints Summary

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/login` | Public | Authenticates user & returns JWT token |
| **GET** | `/api/auth/me` | Authenticated | Retrieves current logged-in user profile |
| **GET** | `/api/dashboard/stats` | Authenticated | Overview stats, low stock count, revenue, recent logs |
| **GET** | `/api/customers` | Authenticated | List customers with search, type/status filter & pagination |
| **GET** | `/api/customers/:id` | Authenticated | Customer details with follow-up timeline & sales history |
| **POST** | `/api/customers` | Admin, Sales | Create a new customer record |
| **PUT** | `/api/customers/:id` | Admin, Sales | Update customer details |
| **POST** | `/api/customers/:id/notes` | Authenticated | Add a new CRM follow-up note to customer timeline |
| **GET** | `/api/products` | Authenticated | List products with low-stock filter (`?lowStock=true`) |
| **POST** | `/api/products` | Admin, Warehouse | Add new product to inventory |
| **PUT** | `/api/products/:id` | Admin, Warehouse | Update product details or stock threshold |
| **GET** | `/api/stock/logs` | Authenticated | Retrieve stock movement log history |
| **POST** | `/api/stock/adjust` | Admin, Warehouse | Log manual stock receipt (`IN`) or return (`OUT`) |
| **GET** | `/api/challans` | Authenticated | List sales challans with status filter |
| **POST** | `/api/challans` | Admin, Sales | Create sales challan with snapshot product items |
| **PUT** | `/api/challans/:id/status` | Admin, Sales, Accounts | Confirm draft challan & trigger atomic stock deduction |
| **GET** | `/api/challans/:id/pdf` | Authenticated | Download/render official PDF Tax Invoice |

---

## 📬 Postman Collection Testing

A pre-configured **Postman Collection** is included at `./postman_collection.json`.

1. Open Postman -> Click **Import**.
2. Select `postman_collection.json`.
3. Run `1. Authentication -> Login (Admin Role)`. The bearer token is saved for subsequent requests.

---

## 🌐 Deployment Instructions (Free Hosting Platforms)

### Frontend Deployment (Vercel)
1. Import repository on Vercel.
2. Root Directory: `frontend`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variable: `VITE_API_BASE_URL=https://your-backend-api.onrender.com`

### Backend Deployment (Render / Railway)
1. Create a New Web Service on Render.
2. Root Directory: `backend`
3. Build Command: `npm install && npx prisma generate && npm run build`
4. Start Command: `npx prisma db push && npm run start`

### PostgreSQL Database Deployment (Supabase / Neon)
1. Create a free PostgreSQL instance on Supabase or Neon.
2. Update `DATABASE_URL` in backend environment variables to your PostgreSQL connection string (`postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require`).
3. Run `npx prisma db push` to push the database schema to PostgreSQL.

---

## 📝 Assumptions Made & Known Limitations

1. **Database Flexibility**: Default local database uses SQLite (`dev.db`) via Prisma ORM for seamless, zero-config evaluation without needing external database server installation. The Prisma schema is 100% compatible with PostgreSQL for production deployment.
2. **Product Image Storage**: Built-in local file upload handling (`/uploads`) with an environment variable hook for AWS S3.
3. **Currency & Localization**: Default currency formatted in Indian Rupees (₹) with standard GSTIN formats as per distribution business norms in India.
