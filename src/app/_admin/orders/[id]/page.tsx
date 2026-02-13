// ===================================
// Admin Order Detail Page - Order edit/detail
// ===================================

// AGENT slave-1 v1.0.1 - Dynamic routes fixed

// Generate static params - admin pages are private, return empty array
// These pages will be generated on-demand at runtime
export function generateStaticParams() {
  return []
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Printer, Mail } from 'lucide-react'
import { useParams } from 'next/navigation'
import { OrderStatusUpdater } from '@/components/admin/OrderStatusUpdater'
import { TrackingEditor } from '@/components/admin/TrackingEditor'
import { OrderItems } from '@/components/orders/OrderItems'
import { OrderReceipt } from '@/components/orders/OrderReceipt'
import { TrackingInfo } from '@/components/orders/TrackingInfo'
import { useAdminOrders } from '@/hooks/useAdminOrders'
import { formatCurrency, formatDate, ORDER_STATUS_CONFIG } from '@/types/orders'
import type { OrderStatus } from '@/types/orders'

export default function AdminOrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const [activeTab, setActiveTab] = useState<'details' | 'receipt'>('details')

  const { orders, isLoading, error, updateOrderStatus, addTrackingInfo } =
    useAdminOrders()

  const order = orders.find((o) => o.id === orderId)

  // Wrapper to match OrderStatusUpdater's expected signature
  const handleUpdateStatus = async (status: OrderStatus, notes?: string) => {
    await updateOrderStatus(orderId, status, notes)
  }

  // Wrapper to match TrackingEditor's expected signature
  const handleAddTracking = async (tracking: {
    carrier: string
    tracking_number: string
    tracking_url?: string
    estimated_delivery?: string
  }) => {
    await addTrackingInfo(orderId, tracking)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-lago-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
        <p className="text-gray-500 mb-6">
          The order you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-lago-gold hover:text-lago-gold-dark font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
      </div>
    )
  }

  const statusConfig = ORDER_STATUS_CONFIG[order.status]

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {order.order_number}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{formatDate(order.created_at)}</span>
              <span>•</span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                           ${statusConfig.bgColor} ${statusConfig.color}`}
              >
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 
                     rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 
                     transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 
                     rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 
                     transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email Customer
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-lago-gold text-lago-gold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Order Details
          </button>
          <button
            onClick={() => setActiveTab('receipt')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'receipt'
                ? 'border-lago-gold text-lago-gold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Receipt / Invoice
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'details' ? (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Items & Customer Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <OrderItems items={order.items || []} />

            {/* Customer Info */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Customer Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Contact
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-gray-900">{order.customer_name}</p>
                    <p className="text-gray-600">{order.customer_email}</p>
                    {order.customer_phone && (
                      <p className="text-gray-600">{order.customer_phone}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Customer ID
                  </h4>
                  <p className="text-sm font-mono text-gray-600">{order.user_id}</p>
                </div>
              </div>
            </div>

            {/* Shipping & Billing */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Shipping Address
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">
                    {order.shipping_address.first_name} {order.shipping_address.last_name}
                  </p>
                  {order.shipping_address.company && <p>{order.shipping_address.company}</p>}
                  <p>{order.shipping_address.address1}</p>
                  {order.shipping_address.address2 && <p>{order.shipping_address.address2}</p>}
                  <p>
                    {order.shipping_address.city}, {order.shipping_address.state}{' '}
                    {order.shipping_address.postal_code}
                  </p>
                  <p>{order.shipping_address.country}</p>
                  {order.shipping_address.phone && (
                    <p className="mt-2">{order.shipping_address.phone}</p>
                  )}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Billing Address
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">
                    {order.billing_address.first_name} {order.billing_address.last_name}
                  </p>
                  {order.billing_address.company && <p>{order.billing_address.company}</p>}
                  <p>{order.billing_address.address1}</p>
                  {order.billing_address.address2 && <p>{order.billing_address.address2}</p>}
                  <p>
                    {order.billing_address.city}, {order.billing_address.state}{' '}
                    {order.billing_address.postal_code}
                  </p>
                  <p>{order.billing_address.country}</p>
                </div>
              </div>
            </div>

            {/* Internal Notes */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Internal Notes
              </h3>
              {order.internal_notes ? (
                <p className="text-sm text-gray-600">{order.internal_notes}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">No internal notes</p>
              )}
            </div>
          </div>

          {/* Right Column - Status & Actions */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Order Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(order.tax)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(order.shipping)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">
                      -{formatCurrency(order.discount)}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200 flex justify-between">
                  <span className="font-medium text-gray-900">Total</span>
                  <span className="font-bold text-lg text-gray-900">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Updater */}
            <OrderStatusUpdater
              order={order}
              onUpdateStatus={handleUpdateStatus}
            />

            {/* Tracking Editor */}
            <TrackingEditor order={order} onAddTracking={handleAddTracking} />

            {/* Customer Tracking View */}
            {order.tracking && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Customer Tracking View
                </h4>
                <TrackingInfo order={order} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <OrderReceipt order={order} />
      )}
    </div>
  )
}
