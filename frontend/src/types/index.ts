export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
  createdAt?: string;
}

export interface CustomerNote {
  id: string;
  customerId: string;
  note: string;
  createdBy: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber?: string;
  type: 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
  address: string;
  status: 'LEAD' | 'ACTIVE' | 'INACTIVE';
  followUpDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  followUpNotes?: CustomerNote[];
  _count?: {
    challans: number;
    followUpNotes: number;
  };
}

export interface StockMovementLog {
  id: string;
  productId: string;
  productName: string;
  quantityChanged: number;
  movementType: 'IN' | 'OUT';
  reason: string;
  createdBy: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  location: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  stockLogs?: StockMovementLog[];
}

export interface ChallanItem {
  id: string;
  challanId: string;
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface SalesChallan {
  id: string;
  challanNumber: string;
  customerId: string;
  customerName: string;
  totalAmount: number;
  totalQuantity: number;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  createdById: string;
  createdByName: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  items: ChallanItem[];
}

export interface DashboardStats {
  customers: {
    total: number;
    active: number;
    leads: number;
  };
  products: {
    total: number;
    lowStockCount: number;
    totalValue: number;
    lowStockAlerts: Product[];
  };
  challans: {
    total: number;
    confirmedCount: number;
    totalRevenue: number;
  };
  recentActivity: {
    stockLogs: StockMovementLog[];
    recentChallans: SalesChallan[];
  };
}
