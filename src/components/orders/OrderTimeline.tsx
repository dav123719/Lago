'use client'

// ===================================
// OrderTimeline Component - Status timeline
// ===================================

import {
  Clock,
  CreditCard,
  Package,
  Truck,
  Home,
  XCircle,
  RotateCcw,
  Store,
  Check,
} from 'lucide-react'
import type { Order, OrderStatus } from '@/types/orders'
import { ORDER_STATUS_CONFIG, formatDateTime } from '@/types/orders'

interface OrderTimelineProps {
  order: Order
}

const timelineSteps: { status: OrderStatus; icon: string; label: string }[] = [
  { status: 'pending', icon: 'Clock', label: 'Order Placed' },
  { status: 'paid', icon: 'CreditCard', label: 'Payment Confirmed' },
  { status: 'processing', icon: 'Package', label: 'Processing' },
  { status: 'shipped', icon: 'Truck', label: 'Shipped' },
  { status: 'delivered', icon: 'Home', label: 'Delivered' },
]

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock,
  CreditCard,
  Package,
  Truck,
  Home,
  XCircle,
  RotateCcw,
  Store,
  Check,
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  const currentStatus = order.status

  // Handle cancelled/refunded orders separately
  if (currentStatus === 'cancelled' || currentStatus === 'refunded') {
    return (
      <div className="bg-lago-charcoal/50 border border-lago-gray/30 rounded-lg p-6">
        <h3 className="text-lg font-medium text-lago-white mb-4">Order Status</h3>
        <div className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <XCircle className="w-8 h-8 text-red-400" />
          <div>
            <p className="text-lago-white font-medium">
              {currentStatus === 'cancelled' ? 'Order Cancelled' : 'Order Refunded'}
            </p>
            <p className="text-lago-muted text-sm">
              {currentStatus === 'cancelled'
                ? order.cancelled_at
                  ? `Cancelled on ${formatDateTime(order.cancelled_at)}`
                  : 'This order has been cancelled'
                : order.refunded_at
                  ? `Refunded on ${formatDateTime(order.refunded_at)}`
                  : 'This order has been refunded'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Handle ready for pickup
  if (currentStatus === 'ready_for_pickup') {
    return (
      <div className="bg-lago-charcoal/50 border border-lago-gray/30 rounded-lg p-6">
        <h3 className="text-lg font-medium text-lago-white mb-4">Order Status</h3>
        <div className="flex items-center gap-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
          <Store className="w-8 h-8 text-cyan-400" />
          <div>
            <p className="text-lago-white font-medium">Ready for Pickup</p>
            <p className="text-lago-muted text-sm">
              Your order is ready to be picked up at our store
            </p>
          </div>
        </div>
      </div>
    )
  }

  const currentStepIndex = timelineSteps.findIndex((step) => step.status === currentStatus)

  return (
    <div className="bg-lago-charcoal/50 border border-lago-gray/30 rounded-lg p-6">
      <h3 className="text-lg font-medium text-lago-white mb-6">Order Timeline</h3>
      
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-lago-gray/30" />
        
        {/* Steps */}
        <div className="space-y-6">
          {timelineSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex
            const isCurrent = index === currentStepIndex
            const Icon = statusIcons[step.icon]

            return (
              <div key={step.status} className="relative flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center
                             transition-colors duration-300 ${
                               isCompleted
                                 ? 'bg-lago-gold text-lago-black'
                                 : 'bg-lago-gray/50 text-lago-muted'
                             } ${isCurrent ? 'ring-2 ring-lago-gold ring-offset-2 ring-offset-lago-charcoal' : ''}`}
                >
                  {isCompleted && index < currentStepIndex ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-0.5">
                  <p
                    className={`font-medium ${
                      isCompleted ? 'text-lago-white' : 'text-lago-muted'
                    }`}
                  >
                    {step.label}
                  </p>
                  
                  {/* Status details */}
                  {isCurrent && (
                    <p className="text-lago-gold text-sm mt-1">
                      {ORDER_STATUS_CONFIG[step.status].label}
                    </p>
                  )}
                  
                  {/* Timestamp */}
                  {isCompleted && (
                    <p className="text-lago-muted text-sm mt-1">
                      {step.status === 'pending' && order.created_at &&
                        formatDateTime(order.created_at)}
                      {step.status === 'paid' && order.paid_at &&
                        formatDateTime(order.paid_at)}
                      {step.status === 'shipped' && order.shipped_at &&
                        formatDateTime(order.shipped_at)}
                      {step.status === 'delivered' && order.delivered_at &&
                        formatDateTime(order.delivered_at)}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
