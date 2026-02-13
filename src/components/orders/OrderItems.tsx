'use client'

// ===================================
// OrderItems Component - Items list
// ===================================

import { Package } from 'lucide-react'
import type { OrderItem } from '@/types/orders'
import { formatCurrency } from '@/types/orders'

interface OrderItemsProps {
  items: OrderItem[]
}

export function OrderItems({ items }: OrderItemsProps) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-lago-charcoal/50 border border-lago-gray/30 rounded-lg p-6">
        <h3 className="text-lg font-medium text-lago-white mb-4">Order Items</h3>
        <p className="text-lago-muted">No items found</p>
      </div>
    )
  }

  return (
    <div className="bg-lago-charcoal/50 border border-lago-gray/30 rounded-lg p-6">
      <h3 className="text-lg font-medium text-lago-white mb-4">
        Order Items ({items.length})
      </h3>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 p-4 bg-lago-dark/50 rounded-lg border border-lago-gray/20"
          >
            {/* Product Image */}
            <div className="w-20 h-20 flex-shrink-0 bg-lago-charcoal rounded-md overflow-hidden">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.product_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-lago-muted" />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-lago-white font-medium truncate">
                {item.product_name}
              </h4>
              
              <p className="text-lago-muted text-sm mt-1">
                SKU: {item.product_sku}
              </p>

              {/* Options */}
              {item.options && Object.keys(item.options).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(item.options).map(([key, value]) => (
                    <span
                      key={key}
                      className="text-xs px-2 py-0.5 bg-lago-gray/30 rounded text-lago-muted"
                    >
                      {key}: {value}
                    </span>
                  ))}
                </div>
              )}

              {/* Price and Quantity */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-lago-muted">
                    {formatCurrency(item.unit_price)} × {item.quantity}
                  </span>
                </div>
                <span className="text-lago-white font-medium">
                  {formatCurrency(item.total_price)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="mt-6 pt-6 border-t border-lago-gray/30 space-y-2">
        {items[0]?.order_id && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-lago-muted">Subtotal</span>
              <span className="text-lago-light">
                {formatCurrency(items.reduce((sum, item) => sum + item.total_price, 0))}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
