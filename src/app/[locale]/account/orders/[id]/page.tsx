// AGENT slave-8 v1.0.1 - Final optimization complete
// ===================================
// Order Detail Page - Single Order View
// ===================================

import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/client'
import { OrderTimeline } from '@/components/orders/OrderTimeline'
import { OrderItems } from '@/components/orders/OrderItems'
import { TrackingInfo } from '@/components/orders/TrackingInfo'
import { OrderReceipt } from '@/components/orders/OrderReceipt'
import { formatCurrency, formatDate, ORDER_STATUS_CONFIG } from '@/types/orders'
import type { Order, OrderStatus } from '@/types/orders'
import type { Locale } from '@/lib/i18n/config'
import { locales } from '@/lib/i18n/config'

// Order detail pages are private (user-specific)
// For static export, we generate placeholder params
export function generateStaticParams() {
  return [
    { locale: 'lv', id: 'placeholder' },
    { locale: 'en', id: 'placeholder' },
    { locale: 'ru', id: 'placeholder' },
  ]
}

interface OrderDetailPageProps {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({
  params,
}: OrderDetailPageProps): Promise<Metadata> {
  const { locale, id } = await params
  return {
    title: `Order ${id} | LAGO`,
    description: 'View your order details',
    alternates: {
      canonical: `/${locale}/account/orders/${id}`,
    },
  }
}

async function getOrder(orderId: string, userId: string): Promise<Order | null> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('id', orderId)
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching order:', error)
    return null
  }

  return data
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { locale, id } = await params
  const validLocale = locale as Locale

  // TODO: Get actual user ID from authentication
  const userId = 'temp-user-id' // Replace with actual auth
  const order = await getOrder(id, userId)

  if (!order) {
    return (
      <div className="min-h-screen bg-lago-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading text-lago-white mb-4">
            Order Not Found
          </h1>
          <Link
            href={`/${validLocale}/account/orders`}
            className="text-lago-gold hover:text-lago-gold-light"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  const statusConfig = ORDER_STATUS_CONFIG[order.status as OrderStatus]

  return (
    <div className="min-h-screen bg-lago-black">
      <div className="container-lg py-12 md:py-16">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            href={`/${validLocale}/account/orders`}
            className="inline-flex items-center gap-2 text-lago-muted hover:text-lago-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading text-lago-white mb-2">
                Order {order.order_number}
              </h1>
              <p className="text-lago-muted">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                         ${statusConfig.bgColor} ${statusConfig.color} w-fit`}
            >
              {statusConfig.label}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Timeline & Items */}
          <div className="lg:col-span-2 space-y-8">
            <OrderTimeline order={order} />
            <OrderItems items={order.items || []} />
            <OrderReceipt order={order} />
          </div>

          {/* Right Column - Summary & Tracking */}
          <div className="space-y-8">
            {/* Order Summary */}
            <div className="bg-lago-charcoal/50 border border-lago-gray/30 rounded-lg p-6">
              <h3 className="text-lg font-medium text-lago-white mb-4">
                Order Summary
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-lago-muted">Subtotal</span>
                  <span className="text-lago-light">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lago-muted">Tax</span>
                  <span className="text-lago-light">{formatCurrency(order.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lago-muted">Shipping</span>
                  <span className="text-lago-light">{formatCurrency(order.shipping)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-lago-muted">Discount</span>
                    <span className="text-green-400">-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-lago-gray/30 flex justify-between">
                  <span className="text-lago-white font-medium">Total</span>
                  <span className="text-lago-gold font-medium text-lg">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tracking Info */}
            {order.tracking && <TrackingInfo order={order} />}

            {/* Shipping Address */}
            <div className="bg-lago-charcoal/50 border border-lago-gray/30 rounded-lg p-6">
              <h3 className="text-lg font-medium text-lago-white mb-4">
                Shipping Address
              </h3>
              <div className="text-sm text-lago-light space-y-1">
                <p className="font-medium">
                  {order.shipping_address.first_name} {order.shipping_address.last_name}
                </p>
                {order.shipping_address.company && (
                  <p>{order.shipping_address.company}</p>
                )}
                <p>{order.shipping_address.address1}</p>
                {order.shipping_address.address2 && (
                  <p>{order.shipping_address.address2}</p>
                )}
                <p>
                  {order.shipping_address.city}, {order.shipping_address.state}{' '}
                  {order.shipping_address.postal_code}
                </p>
                <p>{order.shipping_address.country}</p>
                {order.shipping_address.phone && (
                  <p className="text-lago-muted mt-2">
                    {order.shipping_address.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-lago-charcoal/50 border border-lago-gray/30 rounded-lg p-6">
              <h3 className="text-lg font-medium text-lago-white mb-4">
                Contact Information
              </h3>
              <div className="text-sm text-lago-light space-y-1">
                <p>{order.customer_name}</p>
                <p className="text-lago-muted">{order.customer_email}</p>
                {order.customer_phone && (
                  <p className="text-lago-muted">{order.customer_phone}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
