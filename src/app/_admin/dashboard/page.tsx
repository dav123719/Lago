// ===================================
// Admin Dashboard Page - Stats overview
// ===================================

import Link from 'next/link'
import {
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react'
import { createServerClient } from '@/lib/supabase/client'
import { OrderTable } from '@/components/admin/OrderTable'
import type { Order, OrderStatus } from '@/types/orders'
import { formatCurrency, ORDER_STATUS_CONFIG } from '@/types/orders'

// Dashboard stats
interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  totalProducts: number
  ordersChange: number
  revenueChange: number
  recentOrders: Order[]
  ordersByStatus: Record<OrderStatus, number>
}

async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createServerClient()

  // Get all orders
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false }) as { data: any[], error: any }

  if (ordersError) {
    console.error('Error fetching orders:', ordersError)
  }

  // Get recent orders with items
  const { data: recentOrders, error: recentError } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .order('created_at', { ascending: false })
    .limit(5) as { data: any[], error: any }

  if (recentError) {
    console.error('Error fetching recent orders:', recentError)
  }

  // Calculate stats
  const allOrders = orders || []
  const totalOrders = allOrders.length
  const totalRevenue = allOrders.reduce((sum, order) => {
    if (['paid', 'processing', 'shipped', 'delivered'].includes(order.status)) {
      return sum + order.total
    }
    return sum
  }, 0)

  // Count orders by status
  const ordersByStatus = allOrders.reduce((acc, order) => {
    acc[order.status as OrderStatus] = (acc[order.status as OrderStatus] || 0) + 1
    return acc
  }, {} as Record<OrderStatus, number>)

  // Mock changes (would compare to previous period in real implementation)
  const ordersChange = 12.5
  const revenueChange = 8.3

  // Get customer count
  const { count: customerCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  return {
    totalOrders,
    totalRevenue,
    totalCustomers: customerCount || 0,
    totalProducts: 0, // Would fetch from products table
    ordersChange,
    revenueChange,
    recentOrders: recentOrders || [],
    ordersByStatus,
  }
}

// Stat Card Component
function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  href,
}: {
  title: string
  value: string
  change: number
  changeLabel: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}) {
  const isPositive = change >= 0

  return (
    <Link
      href={href}
      className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg 
                 transition-shadow group"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <div className="flex items-center gap-1 mt-2">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span
              className={`text-sm font-medium ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isPositive ? '+' : ''}
              {change}%
            </span>
            <span className="text-sm text-gray-500">{changeLabel}</span>
          </div>
        </div>
        <div className="w-12 h-12 bg-lago-gold/10 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-lago-gold" />
        </div>
      </div>
    </Link>
  )
}

// Status Summary Component
function StatusSummary({
  ordersByStatus,
}: {
  ordersByStatus: Record<OrderStatus, number>
}) {
  const statuses: OrderStatus[] = [
    'pending',
    'paid',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Orders by Status</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statuses.map((status) => {
          const count = ordersByStatus[status] || 0
          const config = ORDER_STATUS_CONFIG[status]

          return (
            <div
              key={status}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div
                className={`w-3 h-3 rounded-full ${config.bgColor.replace(
                  '/10',
                  ''
                )}`}
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{count}</p>
                <p className="text-xs text-gray-500">{config.label}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toString()}
          change={stats.ordersChange}
          changeLabel="vs last month"
          icon={ShoppingCart}
          href="/admin/orders"
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(stats.totalRevenue)}
          change={stats.revenueChange}
          changeLabel="vs last month"
          icon={DollarSign}
          href="/admin/orders"
        />
        <StatCard
          title="Customers"
          value={stats.totalCustomers.toString()}
          change={5.2}
          changeLabel="vs last month"
          icon={Users}
          href="/admin/customers"
        />
        <StatCard
          title="Products"
          value={stats.totalProducts.toString()}
          change={0}
          changeLabel="vs last month"
          icon={Package}
          href="/admin/products"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-sm text-lago-gold 
                       hover:text-lago-gold-dark font-medium"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <OrderTable orders={stats.recentOrders} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <StatusSummary ordersByStatus={stats.ordersByStatus} />

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/admin/orders"
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg 
                         hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">
                  Process Orders
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                href="/admin/products"
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg 
                         hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">
                  Manage Products
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                href="/admin/customers"
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg 
                         hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">
                  View Customers
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
