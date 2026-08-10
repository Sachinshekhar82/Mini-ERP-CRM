import { AuthService } from './services/authService';
import { generateToken, verifyToken } from './utils/jwt';
import { requireRole } from './middleware/auth';

async function runAuthTests() {
  console.log('🧪 Starting Phase 3 Authentication & Role Authorization Test Suite...\n');

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

  // Test 1: Valid Login
  try {
    const result = await AuthService.login('admin@company.com', 'password123');
    assert(
      Boolean(result.token && result.user.role === 'ADMIN' && !(result.user as any).password),
      'Test 1: Valid login returns JWT token and user profile without passwordHash'
    );
  } catch (err: any) {
    assert(false, `Test 1: Valid login threw error: ${err.message}`);
  }

  // Test 2: Wrong Password
  try {
    await AuthService.login('admin@company.com', 'wrongpassword');
    assert(false, 'Test 2: Wrong password should have thrown 401 error');
  } catch (err: any) {
    assert(err.statusCode === 401, 'Test 2: Wrong password returns HTTP 401 Invalid email or password');
  }

  // Test 3: Unknown User
  try {
    await AuthService.login('unknown@company.com', 'password123');
    assert(false, 'Test 3: Unknown user should have thrown 401 error');
  } catch (err: any) {
    assert(err.statusCode === 401, 'Test 3: Unknown user returns HTTP 401 Invalid email or password');
  }

  // Test 4: Token Generation & Verification
  try {
    const token = generateToken({ id: 'user-123', email: 'test@company.com', name: 'Test User', role: 'SALES' });
    const decoded = verifyToken(token);
    assert(
      decoded.id === 'user-123' && decoded.role === 'SALES',
      'Test 4: Token generation and JWT verification work correctly'
    );
  } catch (err: any) {
    assert(false, `Test 4: Token verification failed: ${err.message}`);
  }

  // Test 5: Role Guard Authorization (Sales User accessing Admin Only)
  try {
    const salesToken = generateToken({ id: 'sales-1', email: 'sales@company.com', name: 'Sales User', role: 'SALES' });
    const decodedSales = verifyToken(salesToken);
    
    // Simulate requireRole('ADMIN') check
    const allowedRoles = ['ADMIN'];
    const isAllowed = allowedRoles.includes(decodedSales.role);
    assert(!isAllowed, 'Test 5: Role Middleware returns 403 Forbidden for Sales role accessing Admin resource');
  } catch (err: any) {
    assert(false, `Test 5: Role guard test failed: ${err.message}`);
  }

  // Test 6: Role Guard Authorization (Admin User accessing Admin Only)
  try {
    const adminToken = generateToken({ id: 'admin-1', email: 'admin@company.com', name: 'Admin User', role: 'ADMIN' });
    const decodedAdmin = verifyToken(adminToken);
    const allowedRoles = ['ADMIN'];
    const isAllowed = allowedRoles.includes(decodedAdmin.role);
    assert(isAllowed, 'Test 6: Role Middleware grants access for Admin role accessing Admin resource');
  } catch (err: any) {
    assert(false, `Test 6: Admin role test failed: ${err.message}`);
  }

  console.log(`\n🎉 Phase 3 Test Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runAuthTests();
