// ===================================
// Order Shipped Email Template
// ===================================

import type { Order, TrackingInfo } from '@/types/orders'
import { formatCurrency, formatDate } from '@/types/orders'

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export function generateOrderShippedEmail(
  order: Order,
  trackingInfo?: TrackingInfo | null
): EmailTemplate {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lago-furniture.com'
  
  const subject = `Your LAGO Order Has Shipped - ${order.order_number}`
  
  const itemsHtml = order.items?.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e8e8e8;">
        <strong>${item.product_name}</strong>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e8e8e8; text-align: center;">${item.quantity}</td>
    </tr>
  `).join('') || ''

  const trackingHtml = trackingInfo ? `
    <tr>
      <td style="padding: 0 40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #c9a96215 0%, #c9a96205 100%); border: 1px solid #c9a96230; border-radius: 8px;">
          <tr>
            <td style="padding: 24px;">
              <h3 style="color: #c9a962; margin: 0 0 16px; font-size: 18px; font-weight: 600;">
                📦 Tracking Information
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 8px;">
                    <span style="color: #4a4a4a; font-size: 14px;">Carrier</span>
                  </td>
                  <td style="padding-bottom: 8px; text-align: right;">
                    <span style="color: #1a1a1a; font-size: 14px; font-weight: 600;">${trackingInfo.carrier}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 8px;">
                    <span style="color: #4a4a4a; font-size: 14px;">Tracking Number</span>
                  </td>
                  <td style="padding-bottom: 8px; text-align: right;">
                    <span style="color: #1a1a1a; font-size: 14px; font-family: monospace; font-weight: 600;">${trackingInfo.tracking_number}</span>
                  </td>
                </tr>
                ${trackingInfo.estimated_delivery ? `
                <tr>
                  <td>
                    <span style="color: #4a4a4a; font-size: 14px;">Estimated Delivery</span>
                  </td>
                  <td style="text-align: right;">
                    <span style="color: #16a34a; font-size: 14px; font-weight: 600;">${formatDate(trackingInfo.estimated_delivery)}</span>
                  </td>
                </tr>
                ` : ''}
              </table>
              ${trackingInfo.tracking_url ? `
              <div style="text-align: center; margin-top: 20px;">
                <a href="${trackingInfo.tracking_url}" 
                   style="display: inline-block; padding: 12px 32px; background: #c9a962; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px;">
                  Track Package
                </a>
              </div>
              ` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  ` : ''

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); padding: 40px; text-align: center;">
              <h1 style="color: #c9a962; margin: 0; font-size: 32px; font-weight: 600; letter-spacing: 4px;">LAGO</h1>
              <p style="color: #a0a0a0; margin: 8px 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Luxury Furniture</p>
            </td>
          </tr>
          
          <!-- Shipped Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #c9a962 0%, #a8893f 100%); padding: 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 12px;">🚚</div>
              <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Your Order Has Shipped!</h2>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 40px 20px;">
              <p style="color: #4a4a4a; margin: 0 0 16px; font-size: 16px; line-height: 1.6;">
                Hi ${order.customer_name},
              </p>
              <p style="color: #4a4a4a; margin: 0 0 16px; font-size: 16px; line-height: 1.6;">
                Great news! Your order <strong style="color: #1a1a1a;">${order.order_number}</strong> has been shipped and is on its way to you.
              </p>
            </td>
          </tr>
          
          <!-- Order Info -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <span style="color: #4a4a4a; font-size: 14px;">Order Number</span>
                        </td>
                        <td style="padding-bottom: 8px; text-align: right;">
                          <span style="color: #1a1a1a; font-size: 14px; font-weight: 600;">${order.order_number}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <span style="color: #4a4a4a; font-size: 14px;">Shipped Date</span>
                        </td>
                        <td style="padding-bottom: 8px; text-align: right;">
                          <span style="color: #1a1a1a; font-size: 14px;">${order.shipped_at ? formatDate(order.shipped_at) : formatDate(new Date().toISOString())}</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span style="color: #4a4a4a; font-size: 14px;">Total</span>
                        </td>
                        <td style="text-align: right;">
                          <span style="color: #c9a962; font-size: 14px; font-weight: 600;">${formatCurrency(order.total)}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Tracking Info -->
          ${trackingHtml}
          
          <!-- Items -->
          <tr>
            <td style="padding: 20px 40px;">
              <h3 style="color: #1a1a1a; margin: 0 0 16px; font-size: 18px; font-weight: 600;">Shipped Items</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f5f5f5;">
                    <th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #4a4a4a; font-weight: 600;">Product</th>
                    <th style="padding: 12px; text-align: center; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #4a4a4a; font-weight: 600; width: 80px;">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </td>
          </tr>
          
          <!-- Shipping Address -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h3 style="color: #1a1a1a; margin: 0 0 16px; font-size: 18px; font-weight: 600;">Shipping To</h3>
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; color: #4a4a4a; font-size: 14px; line-height: 1.6;">
                <strong style="color: #1a1a1a;">${order.shipping_address.first_name} ${order.shipping_address.last_name}</strong><br>
                ${order.shipping_address.company ? `${order.shipping_address.company}<br>` : ''}
                ${order.shipping_address.address1}<br>
                ${order.shipping_address.address2 ? `${order.shipping_address.address2}<br>` : ''}
                ${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}<br>
                ${order.shipping_address.country}
              </div>
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
              <a href="${siteUrl}/account/orders/${order.id}" 
                 style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 16px;">
                View Order Details
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px 40px; text-align: center; border-top: 1px solid #e8e8e8;">
              <p style="color: #4a4a4a; margin: 0 0 8px; font-size: 14px;">
                Questions? Contact us at <a href="mailto:support@lago-furniture.com" style="color: #c9a962; text-decoration: none;">support@lago-furniture.com</a>
              </p>
              <p style="color: #a0a0a0; margin: 0; font-size: 12px;">
                ${new Date().getFullYear()} LAGO Luxury Furniture. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  // Plain text version
  const trackingText = trackingInfo ? `
Tracking Information:
Carrier: ${trackingInfo.carrier}
Tracking Number: ${trackingInfo.tracking_number}
${trackingInfo.estimated_delivery ? `Estimated Delivery: ${formatDate(trackingInfo.estimated_delivery)}` : ''}
${trackingInfo.tracking_url ? `Track your package: ${trackingInfo.tracking_url}` : ''}
` : ''

  const text = `
Your LAGO Order Has Shipped!

Hi ${order.customer_name},

Great news! Your order ${order.order_number} has been shipped and is on its way to you.

Order Number: ${order.order_number}
Shipped Date: ${order.shipped_at ? formatDate(order.shipped_at) : formatDate(new Date().toISOString())}
Total: ${formatCurrency(order.total)}

${trackingText}

Shipped Items:
${order.items?.map(item => `- ${item.product_name} x${item.quantity}`).join('\n') || 'No items'}

Shipping To:
${order.shipping_address.first_name} ${order.shipping_address.last_name}
${order.shipping_address.company ? `${order.shipping_address.company}\n` : ''}${order.shipping_address.address1}
${order.shipping_address.address2 ? `${order.shipping_address.address2}\n` : ''}${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}
${order.shipping_address.country}

View order details: ${siteUrl}/account/orders/${order.id}

Questions? Contact us at support@lago-furniture.com

${new Date().getFullYear()} LAGO Luxury Furniture. All rights reserved.
`

  return {
    subject,
    html,
    text,
  }
}
