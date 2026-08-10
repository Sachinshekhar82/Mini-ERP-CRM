import { CustomerService } from './services/customerService';
import { AuthService } from './services/authService';

async function runCustomerTests() {
  console.log('🧪 Starting Phase 4 Customer CRM Module Test Suite...\n');

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
    // 1. Fetch sales user for createdById
    const salesUser = await AuthService.login('sales@company.com', 'password123');

    // 2. Test Get Customers List, Pagination & Search
    const searchRes = await CustomerService.getCustomers({ search: 'Apex', limit: 5 });
    assert(
      searchRes.customers.length > 0 && searchRes.pagination.total > 0,
      'Test 1: GET /api/customers search by business name returns matching record and pagination'
    );

    const searchGstRes = await CustomerService.getCustomers({ search: '27AABCU9603R1ZN' });
    assert(
      searchGstRes.customers.length > 0,
      'Test 2: GET /api/customers search by GST number works'
    );

    const filterRes = await CustomerService.getCustomers({ customerType: 'DISTRIBUTOR', status: 'ACTIVE' });
    assert(
      filterRes.customers.every((c) => c.customerType === 'DISTRIBUTOR' && c.status === 'ACTIVE'),
      'Test 3: GET /api/customers filter by customerType and status works'
    );

    // 3. Test Create Customer
    const testEmail = `test.crm.${Date.now()}@domain.com`;
    const newCust = await CustomerService.createCustomer({
      customerName: 'Test CRM Client',
      mobile: `+91 ${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      email: testEmail,
      businessName: 'Test CRM Solutions Ltd',
      gstNumber: '27AAACT9999Z1Z0',
      customerType: 'WHOLESALE',
      address: 'Industrial Estate, Pune',
      status: 'LEAD',
      notes: 'Original customer note from signup',
    });
    assert(
      Boolean(newCust.id && newCust.customerName === 'Test CRM Client'),
      'Test 4: POST /api/customers creates new customer record'
    );

    // 4. Test Duplicate Email Protection
    try {
      await CustomerService.createCustomer({
        customerName: 'Duplicate Client',
        mobile: '+91 9999999999',
        email: testEmail, // duplicate!
        businessName: 'Dup Corp',
        customerType: 'RETAIL',
        address: 'Delhi',
      });
      assert(false, 'Test 5: Duplicate customer creation should throw 409 error');
    } catch (err: any) {
      assert(err.statusCode === 409, 'Test 5: Duplicate email returns HTTP 409 Conflict');
    }

    // 5. Test Customer Detail & Separate Follow-up Timeline Notes
    const initialDetail = await CustomerService.getCustomerById(newCust.id);
    const initialNoteCount = initialDetail.followUps.length;

    const followUp1 = await CustomerService.addFollowUp(
      newCust.id,
      'Follow-up Call 1: Discussed sample pricing for 50 units.',
      salesUser.user.id
    );
    assert(Boolean(followUp1.id), 'Test 6: POST /api/customers/:id/follow-ups adds separate timeline note');

    const updatedDetail = await CustomerService.getCustomerById(newCust.id);
    assert(
      updatedDetail.followUps.length === initialNoteCount + 1 &&
        updatedDetail.notes === 'Original customer note from signup',
      'Test 7: Follow-up notes are stored separately without overwriting original customer notes'
    );

    // 6. Test Update Customer
    const updatedCust = await CustomerService.updateCustomer(newCust.id, {
      status: 'ACTIVE',
      followUpDate: '2026-08-30',
    });
    assert(
      updatedCust.status === 'ACTIVE' && updatedCust.followUpDate === '2026-08-30',
      'Test 8: PUT /api/customers/:id updates customer status and follow-up date'
    );

    // 7. Test Delete Customer
    await CustomerService.deleteCustomer(newCust.id);
    try {
      await CustomerService.getCustomerById(newCust.id);
      assert(false, 'Test 9: Deleted customer should not be found');
    } catch (err: any) {
      assert(err.statusCode === 404, 'Test 9: DELETE /api/customers/:id removes record and returns 404 on subsequent get');
    }

    console.log(`\n🎉 Phase 4 Test Summary: ${passed} passed, ${failed} failed.`);
    if (failed > 0) process.exit(1);
  } catch (err: any) {
    console.error('❌ Phase 4 Test Suite Failed:', err);
    process.exit(1);
  }
}

runCustomerTests();
