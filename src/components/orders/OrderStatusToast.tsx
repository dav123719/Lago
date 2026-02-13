'use client'

// ===================================
// OrderStatusToast Component - Realtime notifications
// ===================================

import { useEffect } from 'react'
import { toast } from 'sonner'
import { CheckCircle, Truck, Package, XCircle, RotateCcw, Home, Clock } from 'lucide-react'
import type { OrderStatus } from '@/types/orders'
import { ORDER_STATUS_CONFIG } from '@/types/orders'

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  paid: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: Home,
  cancelled: XCircle,
  refunded: RotateCcw,
  ready_for_pickup: Package,
}

interface OrderStatusToastProps {
  orderId?: string
}

export function OrderStatusToast({ orderId }: OrderStatusToastProps) {
  useEffect(() => {
    const handleStatusChange = (event: CustomEvent<{ status: OrderStatus }>) => {
      const { status } = event.detail
      const config = ORDER_STATUS_CONFIG[status]
      const Icon = statusIcons[config.icon] || CheckCircle

      // Play notification sound for important status changes
      if (['shipped', 'delivered', 'cancelled'].includes(status)) {
        playNotificationSound()
      }

      toast(
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${config.bgColor}`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div>
            <p className="font-medium text-gray-900">Order Update</p>
            <p className="text-sm text-gray-600">
              Your order is now <span className={`font-medium ${config.color}`}>{config.label}</span>
            </p>
          </div>
        </div>,
        {
          duration: 5000,
        }
      )
    }

    // Listen for custom status change events
    window.addEventListener('order-status-change', handleStatusChange as EventListener)

    return () => {
      window.removeEventListener('order-status-change', handleStatusChange as EventListener)
    }
  }, [])

  // Listen for realtime updates from Supabase
  useEffect(() => {
    if (!orderId) return

    // This effect is handled by the useOrder hook's realtime subscription
    // The toast notification is triggered through the custom event

    return () => {
      // Cleanup handled by useOrder hook
    }
  }, [orderId])

  return null
}

// Play notification sound
function playNotificationSound() {
  // Only play sound if user hasn't disabled notifications
  if (typeof window !== 'undefined' && 'Notification' in window) {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }
}

// Admin notification for new orders
export function useNewOrderNotification() {
  useEffect(() => {
    const handleNewOrder = (event: CustomEvent<{ orderId: string; orderNumber: string }>) => {
      const { orderNumber } = event.detail

      toast(
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-lago-gold/10">
            <CheckCircle className="w-5 h-5 text-lago-gold" />
          </div>
          <div>
            <p className="font-medium text-gray-900">New Order Received!</p>
            <p className="text-sm text-gray-600">
              Order <span className="font-medium">{orderNumber}</span> has been placed
            </p>
          </div>
        </div>,
        {
          duration: 8000,
          action: {
            label: 'View',
            onClick: () => {
              window.location.href = `/admin/orders`
            },
          },
        }
      )

      playNotificationSound()
    }

    window.addEventListener('new-order', handleNewOrder as EventListener)

    return () => {
      window.removeEventListener('new-order', handleNewOrder as EventListener)
    }
  }, [])

  return null
}
