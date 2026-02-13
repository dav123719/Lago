// ============================================
// Auth Flow E2E Tests
// ============================================

import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.describe('Login', () => {
    test('user can login with valid credentials', async ({ page }) => {
      await page.goto('/lv/account')

      // Click login tab/link
      await page.click('[data-testid="login-tab"]')

      // Fill credentials
      await page.fill('[name="email"]', 'test@example.com')
      await page.fill('[name="password"]', 'TestPassword123!')

      // Submit login
      await page.click('[data-testid="login-button"]')

      // Verify successful login
      await page.waitForURL(/\/account/)
      await expect(page.locator('[data-testid="user-profile"]')).toBeVisible()
    })

    test('login shows error for invalid credentials', async ({ page }) => {
      await page.goto('/lv/account')
      await page.click('[data-testid="login-tab"]')

      // Fill invalid credentials
      await page.fill('[name="email"]', 'invalid@example.com')
      await page.fill('[name="password"]', 'wrongpassword')
      await page.click('[data-testid="login-button"]')

      // Verify error message
      await expect(page.locator('[data-testid="login-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="login-error"]')).toContainText('Invalid')
    })

    test('login validates email format', async ({ page }) => {
      await page.goto('/lv/account')
      await page.click('[data-testid="login-tab"]')

      // Fill invalid email
      await page.fill('[name="email"]', 'invalid-email')
      await page.fill('[name="password"]', 'somepassword')
      await page.click('[data-testid="login-button"]')

      // Verify validation error
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible()
    })

    test('login requires password', async ({ page }) => {
      await page.goto('/lv/account')
      await page.click('[data-testid="login-tab"]')

      // Fill only email
      await page.fill('[name="email"]', 'test@example.com')
      await page.click('[data-testid="login-button"]')

      // Verify password required error
      await expect(page.locator('[data-testid="password-error"]')).toBeVisible()
    })
  })

  test.describe('Registration', () => {
    test('user can register with valid information', async ({ page }) => {
      await page.goto('/lv/account')
      await page.click('[data-testid="register-tab"]')

      // Fill registration form
      await page.fill('[name="firstName"]', 'John')
      await page.fill('[name="lastName"]', 'Doe')
      await page.fill('[name="email"]', `test${Date.now()}@example.com`)
      await page.fill('[name="phone"]', '+37120000000')
      await page.fill('[name="password"]', 'StrongP@ss123!')
      await page.fill('[name="confirmPassword"]', 'StrongP@ss123!')

      // Accept terms
      await page.check('[name="acceptTerms"]')

      // Submit registration
      await page.click('[data-testid="register-button"]')

      // Verify successful registration
      await page.waitForURL(/\/account/)
      await expect(page.locator('[data-testid="registration-success"]')).toBeVisible()
    })

    test('registration validates password strength', async ({ page }) => {
      await page.goto('/lv/account')
      await page.click('[data-testid="register-tab"]')

      // Fill with weak password
      await page.fill('[name="email"]', 'test@example.com')
      await page.fill('[name="password"]', 'weak')
      await page.fill('[name="confirmPassword"]', 'weak')

      await page.click('[data-testid="register-button"]')

      // Verify password strength error
      await expect(page.locator('[data-testid="password-strength-error"]')).toBeVisible()
    })

    test('registration requires password confirmation match', async ({ page }) => {
      await page.goto('/lv/account')
      await page.click('[data-testid="register-tab"]')

      await page.fill('[name="password"]', 'Password123!')
      await page.fill('[name="confirmPassword"]', 'DifferentPassword123!')
      await page.click('[data-testid="register-button"]')

      // Verify password match error
      await expect(page.locator('[data-testid="password-match-error"]')).toBeVisible()
    })

    test('registration requires terms acceptance', async ({ page }) => {
      await page.goto('/lv/account')
      await page.click('[data-testid="register-tab"]')

      // Fill form without checking terms
      await page.fill('[name="firstName"]', 'John')
      await page.fill('[name="lastName"]', 'Doe')
      await page.fill('[name="email"]', 'test@example.com')
      await page.fill('[name="password"]', 'Password123!')
      await page.fill('[name="confirmPassword"]', 'Password123!')

      await page.click('[data-testid="register-button"]')

      // Verify terms error
      await expect(page.locator('[data-testid="terms-error"]')).toBeVisible()
    })
  })

  test.describe('Password Reset', () => {
    test('user can request password reset', async ({ page }) => {
      await page.goto('/lv/account')
      await page.click('[data-testid="forgot-password-link"]')

      // Fill email
      await page.fill('[name="email"]', 'test@example.com')
      await page.click('[data-testid="reset-password-button"]')

      // Verify success message
      await expect(page.locator('[data-testid="reset-email-sent"]')).toBeVisible()
    })

    test('password reset validates email', async ({ page }) => {
      await page.goto('/lv/account/reset-password')

      // Fill invalid email
      await page.fill('[name="email"]', 'invalid-email')
      await page.click('[data-testid="reset-password-button"]')

      // Verify validation error
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible()
    })
  })

  test.describe('Logout', () => {
    test('user can logout', async ({ page }) => {
      // First login
      await page.goto('/lv/account')
      await page.click('[data-testid="login-tab"]')
      await page.fill('[name="email"]', 'test@example.com')
      await page.fill('[name="password"]', 'TestPassword123!')
      await page.click('[data-testid="login-button"]')

      // Wait for login to complete
      await page.waitForSelector('[data-testid="user-profile"]')

      // Click logout
      await page.click('[data-testid="logout-button"]')

      // Verify logged out state
      await expect(page.locator('[data-testid="login-tab"]')).toBeVisible()
    })
  })

  test.describe('Protected Routes', () => {
    test('redirects to login when accessing protected route', async ({ page }) => {
      // Try to access orders page without login
      await page.goto('/lv/account/orders')

      // Should redirect to login
      await page.waitForURL(/\/account/)
      await expect(page.locator('[data-testid="login-tab"]')).toBeVisible()
    })

    test('allows access to protected route when logged in', async ({ page }) => {
      // Login first
      await page.goto('/lv/account')
      await page.click('[data-testid="login-tab"]')
      await page.fill('[name="email"]', 'test@example.com')
      await page.fill('[name="password"]', 'TestPassword123!')
      await page.click('[data-testid="login-button"]')

      // Navigate to orders
      await page.goto('/lv/account/orders')

      // Should show orders page
      await expect(page.locator('[data-testid="orders-list"]')).toBeVisible()
    })
  })

  test.describe('Profile Management', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each profile test
      await page.goto('/lv/account')
      await page.click('[data-testid="login-tab"]')
      await page.fill('[name="email"]', 'test@example.com')
      await page.fill('[name="password"]', 'TestPassword123!')
      await page.click('[data-testid="login-button"]')
      await page.waitForSelector('[data-testid="user-profile"]')
    })

    test('user can update profile information', async ({ page }) => {
      await page.click('[data-testid="edit-profile-button"]')

      // Update information
      await page.fill('[name="firstName"]', 'UpdatedName')
      await page.fill('[name="phone"]', '+37129999999')

      await page.click('[data-testid="save-profile-button"]')

      // Verify success
      await expect(page.locator('[data-testid="profile-updated"]')).toBeVisible()
    })

    test('user can change password', async ({ page }) => {
      await page.click('[data-testid="change-password-button"]')

      // Fill password change form
      await page.fill('[name="currentPassword"]', 'TestPassword123!')
      await page.fill('[name="newPassword"]', 'NewPassword123!')
      await page.fill('[name="confirmNewPassword"]', 'NewPassword123!')

      await page.click('[data-testid="update-password-button"]')

      // Verify success
      await expect(page.locator('[data-testid="password-updated"]')).toBeVisible()
    })
  })
})
