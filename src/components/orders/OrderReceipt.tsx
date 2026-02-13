'use client'

// ===================================
// OrderReceipt Component - Printable receipt
// ===================================

import { useRef } from 'react'
import { Printer, Download, Check } from 'lucide-react'
import type { Order, OrderStatus } from '@/types/orders'
import { ORDER_STATUS_CONFIG, formatCurrency, formatDateTime, formatDate } from '@/types/orders'

interface OrderReceiptProps {
  order: Order
}

export function OrderReceipt({ order }: OrderReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)
  const statusConfig = ORDER_STATUS_CONFIG[order.status as OrderStatus]

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const receiptContent = receiptRef.current?.innerHTML
    if (!receiptContent) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${order.order_number}</title>
          <style>
            @media print {
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
              .no-print { display: none !important; }
            }
            body { 
              margin: 0; 
              padding: 40px; 
              background: white; 
              color: #1a1a1a;
              font-size: 14px;
              line-height: 1.5;
            }
            .receipt-header { 
              border-bottom: 2px solid #c9a962; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .receipt-title { 
              font-size: 28px; 
              font-weight: 600; 
              color: #1a1a1a; 
              margin: 0 0 10px 0;
            }
            .receipt-meta { 
              color: #4a4a4a; 
              font-size: 13px;
            }
            .section { 
              margin-bottom: 30px; 
            }
            .section-title { 
              font-size: 12px; 
              text-transform: uppercase; 
              letter-spacing: 0.1em; 
              color: #4a4a4a; 
              margin: 0 0 10px 0;
              font-weight: 600;
            }
            .address-block { 
              line-height: 1.6; 
            }
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 10px;
            }
            .items-table th { 
              text-align: left; 
              padding: 12px 8px; 
              border-bottom: 1px solid #e8e8e8;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #4a4a4a;
              font-weight: 600;
            }
            .items-table td { 
              padding: 16px 8px; 
              border-bottom: 1px solid #f0f0f0;
              vertical-align: top;
            }
            .items-table .text-right { 
              text-align: right; 
            }
            .totals { 
              margin-top: 20px; 
              padding-top: 20px; 
              border-top: 2px solid #e8e8e8;
            }
            .total-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 8px; 
            }
            .total-row.final { 
              font-size: 18px; 
              font-weight: 600; 
              border-top: 2px solid #c9a962;
              padding-top: 12px;
              margin-top: 12px;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .footer {
              margin-top: 60px;
              padding-top: 20px;
              border-top: 1px solid #e8e8e8;
              text-align: center;
              color: #4a4a4a;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          ${receiptContent}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const handleDownload = () => {
    const receiptData = {
      order_number: order.order_number,
      date: order.created_at,
      status: order.status,
      customer: {
        name: order.customer_name,
        email: order.customer_email,
      },
      shipping_address: order.shipping_address,
      billing_address: order.billing_address,
      items: order.items,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      discount: order.discount,
      total: order.total,
      currency: order.currency,
    }

    const blob = new Blob([JSON.stringify(receiptData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${order.order_number}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-lago-charcoal/50 border border-lago-gray/30 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-lago-white">Receipt</h3>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-lago-gold/10 hover:bg-lago-gold/20 
                       border border-lago-gold/30 rounded-lg text-lago-gold text-sm font-medium 
                       transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2 bg-lago-gray/30 hover:bg-lago-gray/50 
                       border border-lago-gray/50 rounded-lg text-lago-light text-sm font-medium 
                       transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Receipt Preview */}
      <div
        ref={receiptRef}
        className="bg-white text-lago-black p-8 rounded-lg print:p-0"
      >
        {/* Header */}
        <div className="receipt-header">
          <h1 className="receipt-title">LAGO</h1>
          <div className="receipt-meta">
            <p><strong>Order:</strong> {order.order_number}</p>
            <p><strong>Date:</strong> {formatDateTime(order.created_at)}</p>
            <p>
              <strong>Status:</strong>{' '}
              <span
                className="status-badge"
                style={{
                  backgroundColor: `${statusConfig.color.replace('text-', '').replace('-400', '')}15`,
                  color: statusConfig.color.replace('text-', '').replace('-400', '-600'),
                }}
              >
                {statusConfig.label}
              </span>
            </p>
          </div>
        </div>

        {/* Addresses */}
        <div style={{ display: 'flex', gap: '40px', marginBottom: '30px' }}>
          <div className="section" style={{ flex: 1 }}>
            <h3 className="section-title">Ship To</h3>
            <div className="address-block">
              <p><strong>{order.shipping_address.first_name} {order.shipping_address.last_name}</strong></p>
              {order.shipping_address.company && <p>{order.shipping_address.company}</p>}
              <p>{order.shipping_address.address1}</p>
              {order.shipping_address.address2 && <p>{order.shipping_address.address2}</p>}
              <p>
                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
              </p>
              <p>{order.shipping_address.country}</p>
              {order.shipping_address.phone && <p>{order.shipping_address.phone}</p>}
            </div>
          </div>

          <div className="section" style={{ flex: 1 }}>
            <h3 className="section-title">Bill To</h3>
            <div className="address-block">
              <p><strong>{order.billing_address.first_name} {order.billing_address.last_name}</strong></p>
              {order.billing_address.company && <p>{order.billing_address.company}</p>}
              <p>{order.billing_address.address1}</p>
              {order.billing_address.address2 && <p>{order.billing_address.address2}</p>}
              <p>
                {order.billing_address.city}, {order.billing_address.state} {order.billing_address.postal_code}
              </p>
              <p>{order.billing_address.country}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="section">
          <h3 className="section-title">Items</h3>
          <table className="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Price</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.product_name}</strong>
                    {item.options && Object.keys(item.options).length > 0 && (
                      <div style={{ fontSize: '12px', color: '#4a4a4a', marginTop: '4px' }}>
                        {Object.entries(item.options).map(([key, value]) => (
                          <span key={key}>{key}: {value}</span>
                        )).reduce((prev, curr) => <>{prev} • {curr}</>)}
                      </div>
                    )}
                  </td>
                  <td>{item.product_sku}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">{formatCurrency(item.unit_price)}</td>
                  <td className="text-right">{formatCurrency(item.total_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="totals">
          <div className="total-row">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="total-row">
            <span>Tax</span>
            <span>{formatCurrency(order.tax)}</span>
          </div>
          <div className="total-row">
            <span>Shipping</span>
            <span>{formatCurrency(order.shipping)}</span>
          </div>
          {order.discount > 0 && (
            <div className="total-row" style={{ color: '#16a34a' }}>
              <span>Discount</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="total-row final">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <p>Thank you for your business!</p>
          <p style={{ marginTop: '8px' }}>LAGO Luxury Furniture</p>
        </div>
      </div>
    </div>
  )
}
