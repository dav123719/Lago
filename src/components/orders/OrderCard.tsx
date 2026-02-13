'use client'

// ===================================
// OrderCard Component - Order summary card
// ===================================

import Link from 'next/link'
import {
  Clock,
  CheckCircle,
  Package,
  Truck,
  Home,
  XCircle,
  RotateCcw,
  Store,
  ChevronRight,
} from 'lucide-react'
import type { Order, OrderStatus } from '@/types/orders'
import { ORDER_STATUS_CONFIG, formatCurrency, formatDate } from '@/types/orders'

interface OrderCardProps {
  order: Order
  locale?: string
}

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock,
  CheckCircle,
  Package,
  Truck,
  Home,
  XCircle,
  RotateCcw,
  Store,
}

export function OrderCard({ order, locale = 'en' }: OrderCardProps) {
  const statusConfig = ORDER_STATUS_CONFIG[order.status as OrderStatus]
  const StatusIcon = statusIcons[statusConfig.icon] || Clock

  return (
    <Link
      href={`/${locale}/account/orders/${order.id}`}
      className="group block bg-lago-charcoal/50 border border-lago-gray/30 rounded-lg p-6 
                 hover:border-lago-gold/30 transition-all duration-300 hover:shadow-lg hover:shadow-lago-gold/5"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Order Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lago-white font-medium">{order.order_number}</span>
            <span className="text-lago-muted text-sm">•</span>
            <span className="text-lago-muted text-sm">{formatDate(order.created_at)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <span className="text-lago-muted">
              {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
            </span>
            <span className="text-lago-muted">•</span>
            <span className="text-lago-light">{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-4">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
                       ${statusConfig.bgColor} ${statusConfig.color}`}
          >
            <StatusIcon className="w-4 h-4" />
            <span>{statusConfig.label}</span>
          </div>

          <ChevronRight
            className="w-5 h-5 text-lago-muted group-hover:text-lago-gold 
                       group-hover:translate-x-1 transition-all duration-300"
          />
        </div>
      </div>

      {/* Items Preview */}
      {order.items && order.items.length > 0 && (
        <div className="mt-4 pt-4 border-t border-lago-gray/30">
          <div className="flex items-center gap-3 overflow-hidden">
            {order.items.slice(0, 3).map((item, index) => (
              <div
                key={item.id}
                className="flex-shrink-0 w-12 h-12 bg-lago-dark rounded-md overflow-hidden"
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-lago-gray/30">
                    <Package className="w-5 h-5 text-lago-muted" />
                  </div>
                )}
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="flex-shrink-0 w-12 h-12 bg-lago-gray/30 rounded-md 
                              flex items-center justify-center text-lago-muted text-xs">
                +{order.items.length - 3}
              </div>
            )}
          </div>
        </div>
      )}
    </Link>
  )
}
