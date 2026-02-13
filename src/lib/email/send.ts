// ===================================
// Email Sender Interface
// ===================================

import type { Order } from '@/types/orders'

// Email configuration
interface EmailConfig {
  from: string
  replyTo: string
}

const defaultConfig: EmailConfig = {
  from: process.env.EMAIL_FROM || 'orders@lago-furniture.com',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@lago-furniture.com',
}

// Email data structure
export interface EmailData {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
  cc?: string | string[]
  bcc?: string | string[]
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

// Email provider interface
interface EmailProvider {
  send(data: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }>
}

// Placeholder email provider
// Replace this with your actual email provider (SendGrid, AWS SES, Resend, etc.)
class PlaceholderEmailProvider implements EmailProvider {
  async send(data: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Log email for development
    console.log('📧 Email would be sent:')
    console.log('To:', data.to)
    console.log('Subject:', data.subject)
    console.log('---')
    
    // In production, replace with actual email sending logic
    // Example with SendGrid:
    // return sendgrid.send({
    //   to: data.to,
    //   from: data.from || defaultConfig.from,
    //   subject: data.subject,
    //   html: data.html,
    //   text: data.text,
    // })

    return {
      success: true,
      messageId: `placeholder-${Date.now()}`,
    }
  }
}

// Initialize email provider
// Replace PlaceholderEmailProvider with your actual provider
const emailProvider: EmailProvider = new PlaceholderEmailProvider()

/**
 * Send an email
 */
export async function sendEmail(data: EmailData): Promise<{
  success: boolean
  messageId?: string
  error?: string
}> {
  try {
    const result = await emailProvider.send({
      ...data,
      from: data.from || defaultConfig.from,
      replyTo: data.replyTo || defaultConfig.replyTo,
    })

    if (!result.success) {
      console.error('Failed to send email:', result.error)
    }

    return result
  } catch (error) {
    console.error('Error sending email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(order: Order): Promise<{
  success: boolean
  messageId?: string
  error?: string
}> {
  const { generateOrderConfirmationEmail } = await import('./templates/order-confirmation')
  const { subject, html, text } = generateOrderConfirmationEmail(order)

  return sendEmail({
    to: order.customer_email,
    subject,
    html,
    text,
  })
}

/**
 * Send order shipped email
 */
export async function sendOrderShippedEmail(
  order: Order,
  trackingInfo?: Order['tracking']
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { generateOrderShippedEmail } = await import('./templates/order-shipped')
  const { subject, html, text } = generateOrderShippedEmail(order, trackingInfo)

  return sendEmail({
    to: order.customer_email,
    subject,
    html,
    text,
  })
}

/**
 * Send order delivered email
 */
export async function sendOrderDeliveredEmail(order: Order): Promise<{
  success: boolean
  messageId?: string
  error?: string
}> {
  const subject = `Your LAGO Order ${order.order_number} Has Been Delivered`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
        <header style="text-align: center; padding: 30px 0; border-bottom: 2px solid #c9a962;">
          <h1 style="color: #1a1a1a; margin: 0;">LAGO</h1>
          <p style="color: #4a4a4a; margin: 5px 0 0;">Luxury Furniture</p>
        </header>
        
        <main style="padding: 30px 0;">
          <h2 style="color: #1a1a1a;">Your Order Has Been Delivered!</h2>
          <p>Hi ${order.customer_name},</p>
          <p>Great news! Your order <strong>${order.order_number}</strong> has been delivered.</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Delivered on:</strong> ${order.delivered_at ? new Date(order.delivered_at).toLocaleDateString() : 'Today'}</p>
          </div>
          
          <p>We hope you love your new furniture! If you have any questions or concerns about your order, please don&apos;t hesitate to contact us.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/account/orders/${order.id}"
               style="display: inline-block; padding: 12px 30px; background: #c9a962; color: white; text-decoration: none; border-radius: 4px;">
              View Order Details
            </a>
          </div>
        </main>
        
        <footer style="border-top: 1px solid #e8e8e8; padding-top: 20px; text-align: center; color: #4a4a4a; font-size: 14px;">
          <p>Thank you for choosing LAGO!</p>
          <p style="margin-top: 10px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: #c9a962;">Visit our website</a> | 
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact" style="color: #c9a962;">Contact Support</a>
          </p>
        </footer>
      </body>
    </html>
  `

  return sendEmail({
    to: order.customer_email,
    subject,
    html,
  })
}

/**
 * Send order status update email
 */
export async function sendOrderStatusUpdateEmail(
  order: Order,
  newStatus: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    paid: 'Payment Confirmed',
    processing: 'Being Processed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
    ready_for_pickup: 'Ready for Pickup',
  }

  const subject = `Update on Your LAGO Order ${order.order_number}`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
        <header style="text-align: center; padding: 30px 0; border-bottom: 2px solid #c9a962;">
          <h1 style="color: #1a1a1a; margin: 0;">LAGO</h1>
          <p style="color: #4a4a4a; margin: 5px 0 0;">Luxury Furniture</p>
        </header>
        
        <main style="padding: 30px 0;">
          <h2 style="color: #1a1a1a;">Order Status Update</h2>
          <p>Hi ${order.customer_name},</p>
          <p>Your order <strong>${order.order_number}</strong> is now <strong>${statusLabels[newStatus] || newStatus}</strong>.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/account/orders/${order.id}"
               style="display: inline-block; padding: 12px 30px; background: #c9a962; color: white; text-decoration: none; border-radius: 4px;">
              Track Your Order
            </a>
          </div>
        </main>
        
        <footer style="border-top: 1px solid #e8e8e8; padding-top: 20px; text-align: center; color: #4a4a4a; font-size: 14px;">
          <p>Thank you for choosing LAGO!</p>
        </footer>
      </body>
    </html>
  `

  return sendEmail({
    to: order.customer_email,
    subject,
    html,
  })
}
