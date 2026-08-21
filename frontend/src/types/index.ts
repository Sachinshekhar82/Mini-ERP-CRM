export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'OPERATIONS' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
  createdAt?: string;
}

export interface CustomerFollowUp {
  id: string;
  customerId: string;
  note: string;
  createdById: string;
  createdBy?: { name: string };
  createdAt: string;
}

export interface Customer {
  id: string;
  customerName: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber?: string;
  customerType: 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
  address: string;
  status: 'LEAD' | 'ACTIVE' | 'INACTIVE';
  followUpDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  followUps?: CustomerFollowUp[];
  _count?: {
    challans: number;
    followUps: number;
  };
}

export interface StockMovement {
  id: string;
  productId: string;
  product?: { productName: string; sku: string };
  productName?: string;
  quantityChanged: number;
  movementType: 'IN' | 'OUT';
  reason: string;
  createdById: string;
  createdBy?: { name: string } | string;
  createdAt: string;
}

export interface Product {
  id: string;
  productName: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  warehouseLocation: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  stockMovements?: StockMovement[];
}

export interface SalesChallanItem {
  id: string;
  challanId: string;
  productId: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  totalPrice: number;
}

export interface SalesChallan {
  id: string;
  challanNumber: string;
  customerId: string;
  customerName?: string;
  totalAmount: number;
  totalQuantity: number;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  createdById: string;
  createdBy?: { name: string } | string;
  createdByName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  items: SalesChallanItem[];
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
    totalValue?: number;
    totalStockValue?: number;
    lowStockAlerts: Product[];
  };
  challans: {
    total: number;
    confirmedCount: number;
    totalRevenue: number;
  };
  recentActivity: {
    stockLogs: Array<{
      id: string;
      productName: string;
      quantityChanged: number;
      movementType: 'IN' | 'OUT';
      reason: string;
      createdBy: string;
      createdAt: string;
    }>;
    recentChallans: Array<{
      id: string;
      challanNumber: string;
      customerName: string;
      totalAmount: number;
      status: string;
      createdAt: string;
    }>;
  };
}
