// ===================================
// Stripe Client (Browser)
// ===================================

import { loadStripe, Stripe } from '@stripe/stripe-js'

// Stripe public key
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

// Stripe instance cache
let stripePromise: Promise<Stripe | null> | null = null

/**
 * Get or create Stripe instance
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    if (!STRIPE_PUBLISHABLE_KEY) {
      console.error('Stripe publishable key not configured')
      return Promise.resolve(null)
    }
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)
  }
  return stripePromise
}

/**
 * Redirect to Stripe Checkout
 */
export async function redirectToCheckout(sessionId: string): Promise<void> {
  const stripe = await getStripe()
  
  if (!stripe) {
    throw new Error('Stripe not initialized')
  }

  const { error } = await stripe.redirectToCheckout({ sessionId })
  
  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Initialize Stripe Elements (for embedded checkout)
 */
export async function initializeStripeElements(
  clientSecret: string,
  elementId: string
): Promise<void> {
  const stripe = await getStripe()
  
  if (!stripe) {
    throw new Error('Stripe not initialized')
  }

  // This would be used for embedded checkout with Stripe Elements
  // Implementation depends on your UI requirements
  console.log('Initializing Stripe Elements for element:', elementId)
}
