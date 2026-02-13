'use client'

// ===================================
// OrderTable Component - Orders data table
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
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types/orders'
import { ORDER_STATUS_CONFIG, formatCurrency, formatDate } from '@/types/orders'

interface OrderTableProps {
  orders: Order[]
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (column: string) => void
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

export function OrderTable({
  orders,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  sortBy = 'created_at',
  sortOrder = 'desc',
  onSort,
}: OrderTableProps) {
  const renderSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-lago-gold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-lago-gold" />
    )
  }

  const SortableHeader = ({
    column,
    children,
  }: {
    column: string
    children: React.ReactNode
  }) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider 
                 cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => onSort?.(column)}
    >
      <div className="flex items-center gap-1">
        {children}
        {renderSortIcon(column)}
      </div>
    </th>
  )

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <SortableHeader column="order_number">Order</SortableHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <SortableHeader column="created_at">Date</SortableHeader>
              <SortableHeader column="status">Status</SortableHeader>
              <SortableHeader column="total">Total</SortableHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const statusConfig = ORDER_STATUS_CONFIG[order.status as OrderStatus]
                const StatusIcon = statusIcons[statusConfig.icon] || Clock

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {order.order_number}
                        </span>
                        <span className="text-xs text-gray-500">
                          {order.id.slice(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">
                          {order.customer_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {order.customer_email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">
                        {formatDate(order.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                          statusConfig.bgColor.replace('bg-', 'bg-').replace('/10', '/10'),
                          statusConfig.color.replace('text-', 'text-')
                        )}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig.label}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.total)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">
                        {order.items?.length || 0}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-sm text-lago-gold hover:text-lago-gold-dark font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
              className={cn(
                'p-2 rounded-lg transition-colors',
                currentPage <= 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-200'
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={cn(
                'p-2 rounded-lg transition-colors',
                currentPage >= totalPages
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-200'
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
