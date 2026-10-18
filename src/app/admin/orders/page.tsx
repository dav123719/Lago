// ===================================
// Admin Orders Page - All orders with filters
// ===================================

'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Download } from 'lucide-react'
import { OrderTable } from '@/components/admin/OrderTable'
import { OrderFilters } from '@/components/admin/OrderFilters'
import { useAdminOrders } from '@/hooks/useAdminOrders'
import type { OrderFilters as OrderFiltersType } from '@/types/orders'

export default function AdminOrdersPage() {
  const [filters, setFilters] = useState<OrderFiltersType>({
    status: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc',
  })

  const { orders, stats, isLoading, error, refetch } = useAdminOrders(filters)

  const handleFiltersChange = useCallback((newFilters: OrderFiltersType) => {
    setFilters(newFilters)
  }, [])

  const handleExportCSV = () => {
    // Convert orders to CSV
    const headers = [
      'Order Number',
      'Customer',
      'Email',
      'Status',
      'Total',
      'Items',
      'Date',
    ]
    const rows = orders.map((order) => [
      order.order_number,
      order.customer_name,
      order.customer_email,
      order.status,
      order.total,
      order.items?.length || 0,
      new Date(order.created_at).toISOString(),
    ])

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

    // Download
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500">
            {stats.total} total orders • {stats.pending} pending
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={orders.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 
                     rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <Link
            href="/admin/orders/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-lago-gold text-white 
                     rounded-lg text-sm font-medium hover:bg-lago-gold-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Order
          </Link>
        </div>
      </div>

      {/* Filters */}
      <OrderFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          <p className="font-medium">Error loading orders</p>
          <p className="text-sm">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-sm font-medium hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Orders Table */}
      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12">
          <div className="flex flex-col items-center justify-center text-gray-500">
            <div className="w-8 h-8 border-2 border-lago-gold border-t-transparent rounded-full animate-spin mb-4" />
            <p>Loading orders...</p>
          </div>
        </div>
      ) : (
        <OrderTable orders={orders} />
      )}
    </div>
  )
}
