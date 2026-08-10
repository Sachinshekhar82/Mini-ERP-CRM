import { ChallanService } from './services/challanService';
import { ProductService } from './services/productService';
import { CustomerService } from './services/customerService';
import { AuthService } from './services/authService';
import { prisma } from './config/prisma';

async function runChallanTests() {
  console.log('🧪 Starting Phase 6 Sales Challan Business Logic Test Suite...\n');

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
    const salesUser = await AuthService.login('sales@company.com', 'password123');
    const userId = salesUser.user.id;

    // Create test customer
    const customer = await CustomerService.createCustomer({
      customerName: 'Challan Test Client',
      mobile: `+91 ${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      email: `challan.test.${Date.now()}@domain.com`,
      businessName: 'Challan Test Corp',
      customerType: 'WHOLESALE',
      address: 'Mumbai',
    });

    // Create Product A (Stock: 5)
    const prodA = await ProductService.createProduct(
      {
        productName: 'Challan Product A (Sufficient)',
        sku: `SKU-CH-A-${Date.now()}`,
        category: 'Test',
        unitPrice: 1000,
        currentStock: 5,
        warehouseLocation: 'Rack A1',
      },
      userId
    );

    // Create Product B (Stock: 1)
    const prodB = await ProductService.createProduct(
      {
        productName: 'Challan Product B (Insufficient)',
        sku: `SKU-CH-B-${Date.now()}`,
        category: 'Test',
        unitPrice: 2000,
        currentStock: 1,
        warehouseLocation: 'Rack B1',
      },
      userId
    );

    // 1. Create Draft Challan
    const draftChallan = await ChallanService.createChallan(
      {
        customerId: customer.id,
        status: 'DRAFT',
        notes: 'Test draft challan',
        items: [
          { productId: prodA.id, quantity: 2 }, // Valid
          { productId: prodB.id, quantity: 5 }, // Exceeds stock (5 requested vs 1 available)!
        ],
      },
      userId
    );

    assert(
      draftChallan.status === 'DRAFT' &&
        draftChallan.items.length === 2 &&
        draftChallan.items[0].productNameSnapshot === prodA.productName &&
        draftChallan.items[0].unitPriceSnapshot === 1000,
      'Test 1: POST /api/challans creates DRAFT challan with product snapshots'
    );

    // 2. Test Atomic Confirmation Failure (Partial Stock Failure)
    // Product A has 5 available (req 2 -> ok), Product B has 1 available (req 5 -> FAIL!)
    const initialMovementsCount = await prisma.stockMovement.count({
      where: { productId: { in: [prodA.id, prodB.id] } },
    });

    try {
      await ChallanService.confirmChallan(draftChallan.id, userId);
      assert(false, 'Test 2: Atomic confirmation with partial stock failure should throw error');
    } catch (err: any) {
      assert(
        err.statusCode === 400 && err.message.includes('Insufficient stock'),
        'Test 2: Multi-item confirmation with partial stock failure throws HTTP 400 with product-specific error'
      );
    }

    // Verify Atomic Rollback: ZERO stock changes, ZERO stock movements created, Challan status remains DRAFT!
    const checkProdA = await ProductService.getProductById(prodA.id);
    const checkProdB = await ProductService.getProductById(prodB.id);
    const checkChallan = await ChallanService.getChallanById(draftChallan.id);
    const postMovementsCount = await prisma.stockMovement.count({
      where: { productId: { in: [prodA.id, prodB.id] } },
    });

    assert(
      checkProdA.currentStock === 5 &&
        checkProdB.currentStock === 1 &&
        checkChallan.status === 'DRAFT' &&
        postMovementsCount === initialMovementsCount,
      'Test 3: Atomic Rollback Verified! Zero stock changed, zero movement logs created, challan remains DRAFT'
    );

    // 3. Test Successful Confirmation with Valid Stock
    // Adjust Product B stock up to 10
    await prisma.product.update({ where: { id: prodB.id }, data: { currentStock: 10 } });

    const confirmedChallan = await ChallanService.confirmChallan(draftChallan.id, userId);
    const postConfirmProdA = await ProductService.getProductById(prodA.id);
    const postConfirmProdB = await ProductService.getProductById(prodB.id);

    assert(
      confirmedChallan.status === 'CONFIRMED' &&
        postConfirmProdA.currentStock === 3 && // 5 - 2 = 3
        postConfirmProdB.currentStock === 5, // 10 - 5 = 5
      'Test 4: POST /api/challans/:id/confirm succeeds when all stocks are sufficient, updating stocks and status to CONFIRMED'
    );

    // 4. Test Prevent Confirming Twice
    try {
      await ChallanService.confirmChallan(confirmedChallan.id, userId);
      assert(false, 'Test 5: Confirming an already CONFIRMED challan should throw 400 error');
    } catch (err: any) {
      assert(err.statusCode === 400, 'Test 5: Confirming twice returns HTTP 400 Duplicate confirmation not allowed');
    }

    // 5. Test Prevent Editing Confirmed Challan
    try {
      await ChallanService.updateChallan(confirmedChallan.id, { notes: 'Modifying confirmed' });
      assert(false, 'Test 6: Editing a CONFIRMED challan should throw 400 error');
    } catch (err: any) {
      assert(err.statusCode === 400, 'Test 6: Editing confirmed challan returns HTTP 400');
    }

    // 6. Test Prevent Cancelling Confirmed Challan
    try {
      await ChallanService.cancelChallan(confirmedChallan.id);
      assert(false, 'Test 7: Cancelling a CONFIRMED challan should throw 400 error');
    } catch (err: any) {
      assert(err.statusCode === 400, 'Test 7: Cancelling confirmed challan returns HTTP 400');
    }

    // 7. Test Draft Cancellation
    const draft2 = await ChallanService.createChallan(
      {
        customerId: customer.id,
        status: 'DRAFT',
        items: [{ productId: prodA.id, quantity: 1 }],
      },
      userId
    );

    const cancelledChallan = await ChallanService.cancelChallan(draft2.id);
    assert(cancelledChallan.status === 'CANCELLED', 'Test 8: POST /api/challans/:id/cancel cancels DRAFT challan');

    // 8. Test Prevent Confirming Cancelled Challan
    try {
      await ChallanService.confirmChallan(cancelledChallan.id, userId);
      assert(false, 'Test 9: Confirming a CANCELLED challan should throw 400 error');
    } catch (err: any) {
      assert(err.statusCode === 400, 'Test 9: Confirming cancelled challan returns HTTP 400');
    }

    console.log(`\n🎉 Phase 6 Test Summary: ${passed} passed, ${failed} failed.`);
    if (failed > 0) process.exit(1);
  } catch (err: any) {
    console.error('❌ Phase 6 Test Suite Failed:', err);
    process.exit(1);
  }
}

runChallanTests();
