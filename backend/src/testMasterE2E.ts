import { AuthService } from './services/authService';
import { CustomerService } from './services/customerService';
import { ProductService } from './services/productService';
import { InventoryService } from './services/inventoryService';
import { ChallanService } from './services/challanService';
import { DashboardService } from './services/dashboardService';
import { prisma } from './config/prisma';

async function runMasterE2ETestSuite() {
  console.log('================================================================');
  console.log('🧪 MASTER END-TO-END QA AUDIT & VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, description: string) {
    if (condition) {
      console.log(`  ✅ PASSED: ${description}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${description}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // 1. AUTH & ROLES AUDIT
    // -------------------------------------------------------------------------
    console.log('--- 1. TESTING AUTHENTICATION & ROLE-BASED AUTHORIZATION ---');
    const admin = await AuthService.login('admin@company.com', 'password123');
    const sales = await AuthService.login('sales@company.com', 'password123');
    const warehouse = await AuthService.login('warehouse@company.com', 'password123');
    const accounts = await AuthService.login('accounts@company.com', 'password123');

    assert(admin.user.role === 'ADMIN', 'Admin Login Successful');
    assert(sales.user.role === 'SALES', 'Sales Login Successful');
    assert(warehouse.user.role === 'WAREHOUSE', 'Warehouse Login Successful');
    assert(accounts.user.role === 'ACCOUNTS', 'Accounts Login Successful');

    try {
      await AuthService.login('admin@company.com', 'wrongpassword');
      assert(false, 'Invalid password check');
    } catch (err: any) {
      assert(err.statusCode === 401, 'Invalid password returns HTTP 401');
    }

    try {
      await AuthService.login('unknown@company.com', 'password123');
      assert(false, 'Invalid email check');
    } catch (err: any) {
      assert(err.statusCode === 401, 'Invalid email returns HTTP 401');
    }

    // -------------------------------------------------------------------------
    // 2. CUSTOMER CRM AUDIT
    // -------------------------------------------------------------------------
    console.log('\n--- 2. TESTING CUSTOMER CRM MODULE ---');
    const newCust = await CustomerService.createCustomer({
      customerName: 'QA Audit Customer',
      mobile: `+91 ${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      email: `qa.audit.${Date.now()}@domain.com`,
      businessName: 'QA Audit Enterprises',
      gstNumber: '27AAACQ1111Z1Z0',
      customerType: 'DISTRIBUTOR',
      address: 'Pune, Maharashtra',
      status: 'LEAD',
    });
    assert(Boolean(newCust.id), 'Customer Created Successfully');

    const searchCust = await CustomerService.getCustomers({ search: 'QA Audit' });
    assert(searchCust.customers.length > 0, 'Customer Search by Name/Business');

    const followUp = await CustomerService.addFollowUp(newCust.id, 'QA Follow up test note', sales.user.id);
    assert(Boolean(followUp.id), 'Customer Follow-up Note Created');

    // -------------------------------------------------------------------------
    // 3. PRODUCT & INVENTORY AUDIT
    // -------------------------------------------------------------------------
    console.log('\n--- 3. TESTING PRODUCT & INVENTORY MODULE ---');
    const prodA = await ProductService.createProduct(
      {
        productName: 'CRITICAL TEST PRODUCT A',
        sku: `SKU-CRIT-A-${Date.now()}`,
        category: 'QA Category',
        unitPrice: 1000,
        currentStock: 5, // Exactly 5!
        minimumStock: 2,
        warehouseLocation: 'Rack CR-01',
      },
      warehouse.user.id
    );

    const prodB = await ProductService.createProduct(
      {
        productName: 'CRITICAL TEST PRODUCT B',
        sku: `SKU-CRIT-B-${Date.now()}`,
        category: 'QA Category',
        unitPrice: 2000,
        currentStock: 2, // Exactly 2!
        minimumStock: 2,
        warehouseLocation: 'Rack CR-02',
      },
      warehouse.user.id
    );

    assert(prodA.currentStock === 5 && prodB.currentStock === 2, 'Products A (5) & B (2) Created Successfully');

    // -------------------------------------------------------------------------
    // 4. CRITICAL MULTI-ITEM ATOMIC ROLLBACK TEST
    // -------------------------------------------------------------------------
    console.log('\n--- 4. CRITICAL TEST: MULTI-ITEM ATOMIC ROLLBACK ---');
    console.log('Initial Stock State: Product A = 5 available, Product B = 2 available');
    console.log('Creating Challan requesting: Product A = 2, Product B = 5 (EXCEEDS Product B stock!)');

    const criticalChallan = await ChallanService.createChallan(
      {
        customerId: newCust.id,
        status: 'DRAFT',
        notes: 'Critical atomic rollback test challan',
        items: [
          { productId: prodA.id, quantity: 2 }, // 2 requested vs 5 available (SUFFICIENT)
          { productId: prodB.id, quantity: 5 }, // 5 requested vs 2 available (INSUFFICIENT!)
        ],
      },
      sales.user.id
    );

    const initialMovementLogsCount = await prisma.stockMovement.count({
      where: { productId: { in: [prodA.id, prodB.id] } },
    });

    console.log('Attempting confirmation of invalid challan...');
    try {
      await ChallanService.confirmChallan(criticalChallan.id, sales.user.id);
      assert(false, 'CRITICAL TEST: Confirmation should have failed!');
    } catch (err: any) {
      assert(
        err.statusCode === 400 && err.message.includes('Insufficient stock'),
        'CRITICAL TEST: Confirmation rejected with HTTP 400 Insufficient Stock'
      );
    }

    // Verify Atomic Rollback Requirements:
    // - Product A stock remains 5
    // - Product B stock remains 2
    // - Zero OUT movement logs created
    // - Challan status remains DRAFT
    const checkA = await ProductService.getProductById(prodA.id);
    const checkB = await ProductService.getProductById(prodB.id);
    const checkChallan = await ChallanService.getChallanById(criticalChallan.id);
    const postMovementLogsCount = await prisma.stockMovement.count({
      where: { productId: { in: [prodA.id, prodB.id] } },
    });

    assert(checkA.currentStock === 5, 'CRITICAL TEST PASSED: Product A stock remains exactly 5');
    assert(checkB.currentStock === 2, 'CRITICAL TEST PASSED: Product B stock remains exactly 2');
    assert(postMovementLogsCount === initialMovementLogsCount, 'CRITICAL TEST PASSED: Zero OUT stock movements created');
    assert(checkChallan.status === 'DRAFT', 'CRITICAL TEST PASSED: Sales Challan remains in DRAFT status');

    // -------------------------------------------------------------------------
    // 5. VALID CONFIRMATION TEST
    // -------------------------------------------------------------------------
    console.log('\n--- 5. TESTING VALID CONFIRMATION AFTER REPLENISHMENT ---');
    // Stock IN 10 units for Product B
    await InventoryService.stockIn(prodB.id, 10, 'Replenishment for QA Test', warehouse.user.id);

    // Now confirm the challan (Product A req 2 vs 5 avail, Product B req 5 vs 12 avail)
    const confirmedChallan = await ChallanService.confirmChallan(criticalChallan.id, sales.user.id);

    const postConfirmA = await ProductService.getProductById(prodA.id);
    const postConfirmB = await ProductService.getProductById(prodB.id);

    assert(confirmedChallan.status === 'CONFIRMED', 'Valid Confirmation status becomes CONFIRMED');
    assert(postConfirmA.currentStock === 3, 'Valid Confirmation: Product A stock decreased to 3 (5 - 2)');
    assert(postConfirmB.currentStock === 7, 'Valid Confirmation: Product B stock decreased to 7 (12 - 5)');

    // -------------------------------------------------------------------------
    // 6. DASHBOARD AUDIT
    // -------------------------------------------------------------------------
    console.log('\n--- 6. TESTING DASHBOARD METRICS ---');
    const stats = await DashboardService.getStats();
    assert(typeof stats.customers.total === 'number', 'Dashboard customer metrics functional');
    assert(typeof stats.products.total === 'number', 'Dashboard product metrics functional');
    assert(typeof stats.challans.total === 'number', 'Dashboard challans metrics functional');

    console.log('\n================================================================');
    console.log(`🎉 MASTER QA AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED.`);
    console.log('================================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err: any) {
    console.error('❌ MASTER QA AUDIT FAILED WITH UNHANDLED EXCEPTION:', err);
    process.exit(1);
  }
}

runMasterE2ETestSuite();
