// ===================================
// Order Confirmation Email Template
// ===================================

import type { Order } from '@/types/orders'
import { formatCurrency, formatDate } from '@/types/orders'

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export function generateOrderConfirmationEmail(order: Order): EmailTemplate {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lago-furniture.com'
  
  const subject = `Order Confirmation - ${order.order_number}`
  
  const itemsHtml = order.items?.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e8e8e8;">
        <strong>${item.product_name}</strong>
        ${item.options ? `<br><span style="color: #4a4a4a; font-size: 14px;">${Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(', ')}</span>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e8e8e8; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e8e8e8; text-align: right;">${formatCurrency(item.unit_price)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e8e8e8; text-align: right;">${formatCurrency(item.total_price)}</td>
    </tr>
  `).join('') || ''

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
          
          <!-- Thank You -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <h2 style="color: #1a1a1a; margin: 0 0 16px; font-size: 24px; font-weight: 600;">Thank You for Your Order!</h2>
              <p style="color: #4a4a4a; margin: 0; font-size: 16px; line-height: 1.6;">
                Hi ${order.customer_name}, we&apos;ve received your order and are preparing it for shipment.
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
                        <td>
                          <span style="color: #4a4a4a; font-size: 14px;">Order Date</span>
                        </td>
                        <td style="text-align: right;">
                          <span style="color: #1a1a1a; font-size: 14px;">${formatDate(order.created_at)}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Items -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <h3 style="color: #1a1a1a; margin: 0 0 16px; font-size: 18px; font-weight: 600;">Order Items</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f5f5f5;">
                    <th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #4a4a4a; font-weight: 600;">Product</th>
                    <th style="padding: 12px; text-align: center; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #4a4a4a; font-weight: 600;">Qty</th>
                    <th style="padding: 12px; text-align: right; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #4a4a4a; font-weight: 600;">Price</th>
                    <th style="padding: 12px; text-align: right; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #4a4a4a; font-weight: 600;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </td>
          </tr>
          
          <!-- Totals -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 2px solid #e8e8e8;">
                <tr>
                  <td style="padding: 12px 0; text-align: right;">
                    <span style="color: #4a4a4a;">Subtotal</span>
                  </td>
                  <td style="padding: 12px 0; text-align: right; width: 120px;">
                    <span style="color: #1a1a1a;">${formatCurrency(order.subtotal)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; text-align: right;">
                    <span style="color: #4a4a4a;">Tax</span>
                  </td>
                  <td style="padding: 8px 0; text-align: right;">
                    <span style="color: #1a1a1a;">${formatCurrency(order.tax)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; text-align: right;">
                    <span style="color: #4a4a4a;">Shipping</span>
                  </td>
                  <td style="padding: 8px 0; text-align: right;">
                    <span style="color: #1a1a1a;">${formatCurrency(order.shipping)}</span>
                  </td>
                </tr>
                ${order.discount > 0 ? `
                <tr>
                  <td style="padding: 8px 0; text-align: right;">
                    <span style="color: #16a34a;">Discount</span>
                  </td>
                  <td style="padding: 8px 0; text-align: right;">
                    <span style="color: #16a34a;">-${formatCurrency(order.discount)}</span>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 16px 0; text-align: right; border-top: 2px solid #c9a962;">
                    <span style="color: #1a1a1a; font-size: 18px; font-weight: 600;">Total</span>
                  </td>
                  <td style="padding: 16px 0; text-align: right; border-top: 2px solid #c9a962;">
                    <span style="color: #c9a962; font-size: 18px; font-weight: 600;">${formatCurrency(order.total)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Shipping Address -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <h3 style="color: #1a1a1a; margin: 0 0 16px; font-size: 18px; font-weight: 600;">Shipping Address</h3>
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
            <td style="padding: 20px 40px 40px; text-align: center;">
              <a href="${siteUrl}/account/orders/${order.id}" 
                 style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #c9a962 0%, #a8893f 100%); color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 16px;">
                Track Your Order
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
  const text = `
Thank You for Your Order!

Hi ${order.customer_name}, we've received your order and are preparing it for shipment.

Order Number: ${order.order_number}
Order Date: ${formatDate(order.created_at)}

Order Items:
${order.items?.map(item => `- ${item.product_name} (${item.product_sku}) x${item.quantity} = ${formatCurrency(item.total_price)}`).join('\n') || 'No items'}

Subtotal: ${formatCurrency(order.subtotal)}
Tax: ${formatCurrency(order.tax)}
Shipping: ${formatCurrency(order.shipping)}
${order.discount > 0 ? `Discount: -${formatCurrency(order.discount)}\n` : ''}Total: ${formatCurrency(order.total)}

Shipping Address:
${order.shipping_address.first_name} ${order.shipping_address.last_name}
${order.shipping_address.company ? `${order.shipping_address.company}\n` : ''}${order.shipping_address.address1}
${order.shipping_address.address2 ? `${order.shipping_address.address2}\n` : ''}${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}
${order.shipping_address.country}

Track your order at: ${siteUrl}/account/orders/${order.id}

Questions? Contact us at support@lago-furniture.com

${new Date().getFullYear()} LAGO Luxury Furniture. All rights reserved.
`

  return {
    subject,
    html,
    text,
  }
}
