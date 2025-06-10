import { test, expect } from '@playwright/test';

test.describe('JobTracker AI - Critical User Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should allow user to register, login, and access dashboard', async ({
    page,
  }) => {
    // Test registration flow
    await page.click('text=Sign Up');
    await expect(page).toHaveURL('/auth/register');

    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'password123');

    await page.click('button[type="submit"]');

    // Should redirect to login after successful registration
    await expect(page).toHaveURL('/auth/login');
    await expect(page.locator('text=User created successfully')).toBeVisible();

    // Test login flow
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'password123');

    await page.click('button[type="submit"]');

    // Should redirect to dashboard after successful login
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should display error for invalid login credentials', async ({
    page,
  }) => {
    await page.click('text=Sign In');
    await expect(page).toHaveURL('/auth/login');

    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
    // Should stay on login page
    await expect(page).toHaveURL('/auth/login');
  });

  test('should protect dashboard routes when not authenticated', async ({
    page,
  }) => {
    // Try to access dashboard directly
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('/auth/login');
  });

  test('authenticated user can navigate dashboard sections', async ({
    page,
  }) => {
    // Mock authentication state for this test
    await page.addInitScript(() => {
      // Mock session storage or cookies as needed
      localStorage.setItem('test-auth', 'true');
    });

    // Navigate to dashboard
    await page.goto('/dashboard');

    // Test navigation to applications
    await page.click('text=Applications');
    await expect(page).toHaveURL('/dashboard/applications');
    await expect(page.locator('text=Job Applications')).toBeVisible();

    // Test navigation to resumes
    await page.click('text=Resumes');
    await expect(page).toHaveURL('/dashboard/resumes');
    await expect(page.locator('text=My Resumes')).toBeVisible();
  });

  test('should handle application creation flow', async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('test-auth', 'true');
    });

    await page.goto('/dashboard/applications');

    // Click add new application
    await page.click('text=Add Application');

    // Fill out application form
    await page.fill('input[name="company"]', 'Test Company');
    await page.fill('input[name="position"]', 'Software Engineer');
    await page.fill('input[name="location"]', 'Remote');
    await page.fill('input[name="url"]', 'https://testcompany.com/jobs');
    await page.fill('input[name="salary"]', '100000');
    await page.fill('textarea[name="notes"]', 'Great opportunity');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect back to applications list
    await expect(page).toHaveURL('/dashboard/applications');

    // Should show success message or new application in list
    await expect(page.locator('text=Test Company')).toBeVisible();
  });

  test('should handle resume upload flow', async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('test-auth', 'true');
    });

    await page.goto('/dashboard/resumes');

    // Click upload resume
    await page.click('text=Upload Resume');

    // Mock file upload
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-resume.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('fake pdf content'),
    });

    // Fill resume title
    await page.fill('input[name="title"]', 'My Test Resume');

    // Submit upload
    await page.click('button[type="submit"]');

    // Should show uploaded resume
    await expect(page.locator('text=My Test Resume')).toBeVisible();
  });

  test('should handle responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Check if mobile menu is present
    await expect(
      page.locator('[data-testid="mobile-menu-trigger"]')
    ).toBeVisible();

    // Test mobile navigation
    await page.click('[data-testid="mobile-menu-trigger"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });

  test('should handle navigation performance', async ({ page }) => {
    // Start performance monitoring
    await page.goto('/');

    const startTime = Date.now();

    // Navigate between pages
    await page.click('text=Sign In');
    await page.waitForLoadState('networkidle');

    await page.click('text=Sign Up');
    await page.waitForLoadState('networkidle');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Navigation should complete within reasonable time (5 seconds)
    expect(totalTime).toBeLessThan(5000);
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/**', route => {
      route.abort('failed');
    });

    await page.goto('/auth/login');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');

    await page.click('button[type="submit"]');

    // Should show error message for network failure
    await expect(page.locator('text=Something went wrong')).toBeVisible();
  });
});
