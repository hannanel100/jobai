#!/usr/bin/env node

/**
 * Auth Protection Verification Script
 * 
 * This script tests the authentication protection mechanisms
 * by making direct HTTP requests to protected routes
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3001';

class AuthProtectionTester {
  constructor() {
    this.results = [];
  }

  async testRoute(route, expected, method = 'GET') {
    try {
      const response = await fetch(`${BASE_URL}${route}`, {
        method,
        redirect: 'manual', // Don't follow redirects automatically
        headers: {
          'User-Agent': 'AuthTester/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      const status = response.status;
      const redirected = status >= 300 && status < 400;
      const location = response.headers.get('location');

      let passed = false;
      let message = '';

      if (expected === 'protected') {
        // Protected routes should either:
        // 1. Redirect to login (302/307 with location to /auth/login)
        // 2. Return 401/403
        if (redirected && location?.includes('/auth/login')) {
          passed = true;
          message = `✅ Correctly redirected to login: ${location}`;
        } else if (status === 401 || status === 403) {
          passed = true;
          message = `✅ Correctly returned ${status} status`;
        } else {
          passed = false;
          message = `❌ Expected redirect to login or 401/403, got ${status}`;
        }
      } else {
        // Public routes should return 200 or redirect to non-auth pages
        if (status === 200) {
          passed = true;
          message = `✅ Public route accessible`;
        } else if (redirected && !location?.includes('/auth/')) {
          passed = true;
          message = `✅ Public route with valid redirect: ${location}`;
        } else {
          passed = false;
          message = `❌ Public route should be accessible, got ${status}`;
        }
      }

      return {
        route,
        expected,
        status,
        redirected,
        finalUrl: location || undefined,
        passed,
        message
      };

    } catch (error) {
      return {
        route,
        expected,
        status: 0,
        redirected: false,
        passed: false,
        message: `❌ Request failed: ${error.message}`
      };
    }
  }

  async runTests() {
    console.log('🔐 Starting Authentication Protection Tests\n');
    console.log(`Testing against: ${BASE_URL}\n`);

    // Test protected routes
    const protectedRoutes = [
      '/dashboard',
      '/dashboard/applications',
      '/dashboard/applications/new',
      '/dashboard/resumes',
      '/dashboard/applications/test-id/edit'
    ];

    console.log('Testing Protected Routes:');
    console.log('========================');
    
    for (const route of protectedRoutes) {
      const result = await this.testRoute(route, 'protected');
      this.results.push(result);
      console.log(`${route}: ${result.message}`);
    }

    console.log('\nTesting Public Routes:');
    console.log('=====================');

    // Test public routes
    const publicRoutes = [
      '/',
      '/auth/login',
      '/auth/register'
    ];

    for (const route of publicRoutes) {
      const result = await this.testRoute(route, 'public');
      this.results.push(result);
      console.log(`${route}: ${result.message}`);
    }

    // Test with different methods
    console.log('\nTesting Protected POST Routes:');
    console.log('=============================');

    const postRoutes = [
      '/dashboard/applications'
    ];

    for (const route of postRoutes) {
      const result = await this.testRoute(route, 'protected', 'POST');
      this.results.push(result);
      console.log(`POST ${route}: ${result.message}`);
    }
  }

  generateReport() {
    console.log('\n📊 Test Summary:');
    console.log('================');

    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const failed = this.results.filter(r => !r.passed);

    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${total - passed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

    if (failed.length > 0) {
      console.log('🚨 Failed Tests:');
      console.log('================');
      failed.forEach(result => {
        console.log(`${result.route}: ${result.message}`);
        console.log(`  Status: ${result.status}`);
        if (result.finalUrl) {
          console.log(`  Redirect: ${result.finalUrl}`);
        }
        console.log('');
      });
    }

    if (passed === total) {
      console.log('🎉 All authentication protection tests passed!');
    } else {
      console.log('⚠️  Some authentication protection issues found.');
      console.log('Please review the failed tests above.');
    }
  }

  async run() {
    await this.runTests();
    this.generateReport();
  }
}

// Run the tests
const tester = new AuthProtectionTester();
tester.run().catch(console.error);
