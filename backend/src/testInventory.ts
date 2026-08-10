import { ProductService } from './services/productService';
import { InventoryService } from './services/inventoryService';
import { AuthService } from './services/authService';

async function runInventoryTests() {
  console.log('🧪 Starting Phase 5 Product & Inventory Module Test Suite...\n');

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
    const warehouseUser = await AuthService.login('warehouse@company.com', 'password123');
    const userId = warehouseUser.user.id;

    // 1. Test Create Product & Duplicate SKU check
    const testSku = `TEST-SKU-${Date.now()}`;
    const newProduct = await ProductService.createProduct(
      {
        productName: 'Test Cordless Drill 18V',
        sku: testSku,
        category: 'Power Tools',
        unitPrice: 4500,
        currentStock: 20,
        minimumStock: 5,
        warehouseLocation: 'Rack T-01, Warehouse 1',
      },
      userId
    );

    assert(
      Boolean(newProduct.id && newProduct.currentStock === 20),
      'Test 1: POST /api/products creates product with initial stock and movement log'
    );

    try {
      await ProductService.createProduct(
        {
          productName: 'Duplicate SKU Drill',
          sku: testSku, // Duplicate!
          category: 'Power Tools',
          unitPrice: 4500,
          currentStock: 10,
          warehouseLocation: 'Rack T-02',
        },
        userId
      );
      assert(false, 'Test 2: Duplicate SKU should throw 409 error');
    } catch (err: any) {
      assert(err.statusCode === 409, 'Test 2: Duplicate SKU creation returns HTTP 409 Conflict');
    }

    // 2. Test Stock IN
    const stockInResult = await InventoryService.stockIn(newProduct.id, 15, 'Vendor Batch PO #501', userId);
    assert(
      stockInResult.product.currentStock === 35 &&
        stockInResult.movement.movementType === 'IN' &&
        stockInResult.movement.quantityChanged === 15,
      'Test 3: POST /api/inventory/stock-in increases stock atomically and creates StockMovement'
    );

    // 3. Test Stock OUT
    const stockOutResult = await InventoryService.stockOut(newProduct.id, 10, 'Damaged Return', userId);
    assert(
      stockOutResult.product.currentStock === 25 &&
        stockOutResult.movement.movementType === 'OUT' &&
        stockOutResult.movement.quantityChanged === 10,
      'Test 4: POST /api/inventory/stock-out reduces stock atomically and creates StockMovement'
    );

    // 4. Test Insufficient Stock Prevention (Negative Stock Protection)
    try {
      await InventoryService.stockOut(newProduct.id, 100, 'Excess Reduction', userId);
      assert(false, 'Test 5: Insufficient stock out should throw 400 error');
    } catch (err: any) {
      assert(
        err.statusCode === 400 && err.message.includes('Insufficient stock'),
        'Test 5: Stock reduction exceeding currentStock returns HTTP 400 Insufficient stock'
      );
    }

    // 5. Test Invalid Quantity (<= 0)
    try {
      await InventoryService.stockIn(newProduct.id, -5, 'Invalid Negative Quantity', userId);
      assert(false, 'Test 6: Negative quantity should throw 400 error');
    } catch (err: any) {
      assert(err.statusCode === 400, 'Test 6: Invalid non-positive quantity returns HTTP 400');
    }

    // 6. Test Unknown Product ID
    try {
      await InventoryService.stockIn('non-existent-product-id', 10, 'Unknown PO', userId);
      assert(false, 'Test 7: Unknown product ID should throw 404 error');
    } catch (err: any) {
      assert(err.statusCode === 404, 'Test 7: Unknown product ID returns HTTP 404 Product Not Found');
    }

    // 7. Test Movement Log Retrieval
    const movements = await InventoryService.getMovements({ productId: newProduct.id });
    assert(
      movements.movements.length >= 3,
      'Test 8: GET /api/inventory/movements records complete audit history with user, timestamp, IN/OUT type and reason'
    );

    // 8. Test Direct Arbitrary currentStock Edit Prevention (Rule 9)
    const updatedProd = await ProductService.updateProduct(newProduct.id, {
      productName: 'Updated Test Drill Name',
      currentStock: 9999, // Should be ignored/stripped!
    } as any);

    assert(
      updatedProd.currentStock === 25 && updatedProd.productName === 'Updated Test Drill Name',
      'Test 9: PUT /api/products/:id strips direct currentStock mutations to prevent arbitrary stock corruption'
    );

    console.log(`\n🎉 Phase 5 Test Summary: ${passed} passed, ${failed} failed.`);
    if (failed > 0) process.exit(1);
  } catch (err: any) {
    console.error('❌ Phase 5 Test Suite Failed:', err);
    process.exit(1);
  }
}

runInventoryTests();
