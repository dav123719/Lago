'use client'

// ===================================
// OrderStatusUpdater Component - Status change UI
// ===================================

import { useState } from 'react'
import {
  Clock,
  CheckCircle,
  Package,
  Truck,
  Home,
  XCircle,
  RotateCcw,
  Store,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types/orders'
import {
  ORDER_STATUS_CONFIG,
  getAvailableStatuses,
  isValidStatusTransition,
} from '@/types/orders'

interface OrderStatusUpdaterProps {
  order: Order
  onUpdateStatus: (status: OrderStatus, notes?: string) => Promise<void>
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

export function OrderStatusUpdater({
  order,
  onUpdateStatus,
}: OrderStatusUpdaterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null)
  const [notes, setNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentStatus = order.status as OrderStatus
  const currentConfig = ORDER_STATUS_CONFIG[currentStatus]
  const availableStatuses = getAvailableStatuses(currentStatus)

  const handleStatusSelect = (status: OrderStatus) => {
    setSelectedStatus(status)
    setNotes('')
    setError(null)
  }

  const handleConfirm = async () => {
    if (!selectedStatus) return

    if (!isValidStatusTransition(currentStatus, selectedStatus)) {
      setError('Invalid status transition')
      return
    }

    setIsUpdating(true)
    setError(null)

    try {
      await onUpdateStatus(selectedStatus, notes || undefined)
      setSelectedStatus(null)
      setNotes('')
      setIsOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  const StatusIcon = statusIcons[currentConfig.icon] || Clock

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status</h3>

      {/* Current Status */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4">
        <div
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            currentConfig.bgColor,
            currentConfig.color
          )}
        >
          <StatusIcon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Current Status</p>
          <p className="text-lg font-medium text-gray-900">{currentConfig.label}</p>
        </div>
      </div>

      {/* Status Dropdown */}
      {availableStatuses.length > 0 && (
        <div className="space-y-4">
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 border rounded-lg',
                'text-left transition-colors',
                isOpen
                  ? 'border-lago-gold ring-1 ring-lago-gold'
                  : 'border-gray-300 hover:border-gray-400'
              )}
            >
              <span className={selectedStatus ? 'text-gray-900' : 'text-gray-500'}>
                {selectedStatus
                  ? ORDER_STATUS_CONFIG[selectedStatus].label
                  : 'Select new status...'}
              </span>
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-gray-400 transition-transform',
                  isOpen && 'rotate-180'
                )}
              />
            </button>

            {isOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                {availableStatuses.map((status) => {
                  const config = ORDER_STATUS_CONFIG[status]
                  const Icon = statusIcons[config.icon] || Clock

                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusSelect(status)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 text-left',
                        'hover:bg-gray-50 transition-colors',
                        selectedStatus === status && 'bg-lago-gold/5',
                        'first:rounded-t-lg last:rounded-b-lg'
                      )}
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center',
                          config.bgColor,
                          config.color
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-900">
                        {config.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Notes */}
          {selectedStatus && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add a note about this status change..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-lago-gold focus:border-transparent resize-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleConfirm}
                  disabled={isUpdating}
                  className={cn(
                    'flex-1 px-4 py-2 bg-lago-gold text-white rounded-lg font-medium',
                    'hover:bg-lago-gold-dark transition-colors',
                    isUpdating && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {isUpdating ? 'Updating...' : 'Update Status'}
                </button>
                <button
                  onClick={() => {
                    setSelectedStatus(null)
                    setNotes('')
                    setError(null)
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg 
                           font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {availableStatuses.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          No further status updates available for this order.
        </p>
      )}
    </div>
  )
}
