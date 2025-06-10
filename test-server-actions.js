#!/usr/bin/env node

/**
 * Server Action Protection Test
 * 
 * Tests that server actions properly reject unauthorized requests
 */

const BASE_URL = 'http://localhost:3001';

async function testServerAction(actionData, description) {
  try {
    console.log(`\n🧪 Testing: ${description}`);
    
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': BASE_URL,
        'Referer': `${BASE_URL}/dashboard/applications`
      },
      body: new URLSearchParams(actionData),
      redirect: 'manual'
    });

    const status = response.status;
    const location = response.headers.get('location');

    if (status >= 300 && status < 400 && location?.includes('/auth/login')) {
      console.log(`✅ Server action properly protected (${status} → ${location})`);
      return true;
    } else if (status === 401 || status === 403) {
      console.log(`✅ Server action properly rejected (${status})`);
      return true;
    } else {
      console.log(`❌ Server action not properly protected (${status})`);
      return false;
    }

  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    return false;
  }
}

async function runServerActionTests() {
  console.log('🔐 Testing Server Action Protection');
  console.log('==================================');

  const tests = [
    {
      data: { action: 'getApplications' },
      description: 'Get Applications Action'
    },
    {
      data: { action: 'createApplication', company: 'Test Corp', position: 'Engineer' },
      description: 'Create Application Action'
    },
    {
      data: { action: 'logout' },
      description: 'Logout Action (should be allowed)'
    }
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    const result = await testServerAction(test.data, test.description);
    if (result) passed++;
  }

  console.log('\n📊 Server Action Test Summary:');
  console.log('=============================');
  console.log(`Passed: ${passed}/${total}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (passed === total) {
    console.log('\n🎉 All server actions are properly protected!');
  } else {
    console.log('\n⚠️  Some server actions may need additional protection.');
  }
}

// Test if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/`, { method: 'HEAD' });
    return response.ok || response.status < 500;
  } catch {
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server not running on http://localhost:3001');
    console.log('Please start the development server with: npm run dev');
    process.exit(1);
  }

  await runServerActionTests();
})();
