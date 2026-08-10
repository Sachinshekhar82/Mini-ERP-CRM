import { DashboardService } from './services/dashboardService';

async function runDashboardTests() {
  console.log('🧪 Starting Dashboard Module Test Suite...\n');

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
    const stats = await DashboardService.getStats();

    assert(
      typeof stats.customers.total === 'number' &&
        typeof stats.customers.active === 'number' &&
        typeof stats.customers.leads === 'number',
      'Test 1: Dashboard returns customer metrics (total, active, leads)'
    );

    assert(
      typeof stats.products.total === 'number' &&
        typeof stats.products.totalStockQuantity === 'number' &&
        typeof stats.products.lowStockCount === 'number' &&
        Array.isArray(stats.products.lowStockAlerts),
      'Test 2: Dashboard returns product & inventory stock metrics'
    );

    assert(
      typeof stats.challans.total === 'number' &&
        typeof stats.challans.draftCount === 'number' &&
        typeof stats.challans.confirmedCount === 'number' &&
        typeof stats.challans.cancelledCount === 'number' &&
        typeof stats.challans.totalRevenue === 'number',
      'Test 3: Dashboard returns sales challan status breakdown (draft, confirmed, cancelled, revenue)'
    );

    assert(
      typeof stats.followUps.total === 'number' && typeof stats.followUps.dueCount === 'number',
      'Test 4: Dashboard returns customer CRM follow-up metrics'
    );

    assert(
      Array.isArray(stats.recentActivity.stockLogs) && Array.isArray(stats.recentActivity.recentChallans),
      'Test 5: Dashboard returns recent activity feeds (stock logs & recent challans)'
    );

    console.log(`\n🎉 Dashboard Test Summary: ${passed} passed, ${failed} failed.`);
    if (failed > 0) process.exit(1);
  } catch (err: any) {
    console.error('❌ Dashboard Test Suite Failed:', err);
    process.exit(1);
  }
}

runDashboardTests();
