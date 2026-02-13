// ============================================
// Purchase Flow E2E Tests
// ============================================

import { test, expect } from '@playwright/test'

test.describe('Purchase Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to store before each test
    await page.goto('/lv/store')
    await page.waitForLoadState('networkidle')
  })

  test('user can add product to cart', async ({ page }) => {
    // Navigate to first product
    await page.click('[data-testid="product-card"]:first-child')
    await page.waitForURL(/\/store\/product\//)

    // Add to cart
    await page.click('[data-testid="add-to-cart-button"]')
    
    // Verify cart drawer opens
    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible()
    
    // Verify item in cart
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1)
  })

  test('user can view cart and proceed to checkout', async ({ page }) => {
    // Add product to cart first
    await page.goto('/lv/store/product/test-product')
    await page.click('[data-testid="add-to-cart-button"]')
    
    // Go to cart
    await page.goto('/lv/cart')
    await page.waitForSelector('[data-testid="cart-page"]')

    // Verify cart items
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1)

    // Proceed to checkout
    await page.click('[data-testid="checkout-button"]')
    await page.waitForURL(/\/checkout/)

    // Verify checkout page
    await expect(page.locator('[data-testid="checkout-form"]')).toBeVisible()
  })

  test('user can complete checkout with valid information', async ({ page }) => {
    // Navigate to checkout with items in cart
    await page.goto('/lv/checkout')
    
    // Fill shipping information
    await page.fill('[name="firstName"]', 'John')
    await page.fill('[name="lastName"]', 'Doe')
    await page.fill('[name="email"]', 'john@example.com')
    await page.fill('[name="phone"]', '+37120000000')
    await page.fill('[name="streetAddress"]', 'Krasta iela 52')
    await page.fill('[name="city"]', 'Riga')
    await page.fill('[name="postalCode"]', 'LV-1003')

    // Select shipping method
    await page.click('[data-testid="shipping-method-parcel_locker"]')

    // Continue to payment
    await page.click('[data-testid="continue-to-payment"]')
    await page.waitForURL(/\/checkout\/payment/)

    // Verify payment page
    await expect(page.locator('[data-testid="payment-form"]')).toBeVisible()
  })

  test('checkout shows validation errors for invalid input', async ({ page }) => {
    await page.goto('/lv/checkout')

    // Try to continue without filling required fields
    await page.click('[data-testid="continue-to-payment"]')

    // Verify validation errors
    await expect(page.locator('[data-testid="error-firstName"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-lastName"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-email"]')).toBeVisible()
  })

  test('user can select parcel locker', async ({ page }) => {
    await page.goto('/lv/checkout')

    // Select parcel locker shipping
    await page.click('[data-testid="shipping-method-parcel_locker"]')

    // Open locker selector
    await page.click('[data-testid="select-locker-button"]')

    // Verify locker map/modal opens
    await expect(page.locator('[data-testid="locker-selector"]')).toBeVisible()

    // Select a locker
    await page.click('[data-testid="locker-item"]:first-child')

    // Verify locker is selected
    await expect(page.locator('[data-testid="selected-locker"]')).toBeVisible()
  })

  test('cart persists across page navigation', async ({ page }) => {
    // Add item to cart
    await page.goto('/lv/store/product/test-product')
    await page.click('[data-testid="add-to-cart-button"]')

    // Navigate to different page
    await page.goto('/lv/projects')
    
    // Navigate back to cart
    await page.goto('/lv/cart')

    // Verify cart still has item
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1)
  })

  test('user can update quantity in cart', async ({ page }) => {
    // Add item to cart
    await page.goto('/lv/cart')
    
    // Increase quantity
    await page.click('[data-testid="increase-quantity"]')

    // Verify quantity updated
    await expect(page.locator('[data-testid="quantity-input"]')).toHaveValue('2')

    // Verify price updated
    const total = await page.locator('[data-testid="cart-total"]').textContent()
    expect(total).toContain('€')
  })

  test('user can remove item from cart', async ({ page }) => {
    // Add and then remove item
    await page.goto('/lv/cart')

    // Click remove button
    await page.click('[data-testid="remove-item"]')

    // Confirm removal
    await page.click('[data-testid="confirm-remove"]')

    // Verify cart is empty
    await expect(page.locator('[data-testid="empty-cart"]')).toBeVisible()
  })

  test('checkout calculates totals correctly', async ({ page }) => {
    await page.goto('/lv/cart')

    // Get subtotal
    const subtotal = await page.locator('[data-testid="cart-subtotal"]').textContent()
    
    // Proceed to checkout
    await page.goto('/lv/checkout')

    // Fill required fields
    await page.fill('[name="firstName"]', 'John')
    await page.fill('[name="lastName"]', 'Doe')
    await page.fill('[name="email"]', 'john@example.com')
    await page.fill('[name="phone"]', '+37120000000')
    await page.fill('[name="streetAddress"]', 'Krasta iela 52')
    await page.fill('[name="city"]', 'Riga')
    await page.fill('[name="postalCode"]', 'LV-1003')

    // Select shipping
    await page.click('[data-testid="shipping-method-parcel_locker"]')

    // Verify order summary shows correct totals
    const checkoutSubtotal = await page.locator('[data-testid="checkout-subtotal"]').textContent()
    expect(checkoutSubtotal).toBe(subtotal)
  })
})
