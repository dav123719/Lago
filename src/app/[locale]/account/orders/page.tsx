'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, ArrowLeft, Package, Clock, CheckCircle, Truck } from 'lucide-react'
import { Locale } from '@/lib/i18n/config'

interface OrdersPageProps {
  params: Promise<{ locale: Locale }>
}

const labels = {
  lv: {
    title: 'Mani pasūtījumi',
    subtitle: 'Skatiet savu pasūtījumu vēsturi',
    back: 'Atpakaļ uz kontu',
    noOrders: 'Vēl nav pasūtījumu',
    startShopping: 'Sākt iepirkšanos',
    orderNumber: 'Pasūtījuma nr.',
    date: 'Datums',
    status: 'Statuss',
    total: 'Kopā',
    pending: 'Gaida apstrādi',
    processing: 'Apstrādē',
    shipped: 'Nosūtīts',
    delivered: 'Piegādāts',
    cancelled: 'Atcelts',
  },
  en: {
    title: 'My Orders',
    subtitle: 'View your order history',
    back: 'Back to account',
    noOrders: 'No orders yet',
    startShopping: 'Start shopping',
    orderNumber: 'Order #',
    date: 'Date',
    status: 'Status',
    total: 'Total',
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  },
  ru: {
    title: 'Мои заказы',
    subtitle: 'Просмотр истории заказов',
    back: 'Назад в аккаунт',
    noOrders: 'Пока нет заказов',
    startShopping: 'Начать покупки',
    orderNumber: 'Заказ №',
    date: 'Дата',
    status: 'Статус',
    total: 'Итого',
    pending: 'В ожидании',
    processing: 'В обработке',
    shipped: 'Отправлен',
    delivered: 'Доставлен',
    cancelled: 'Отменен',
  },
}

const statusIcons = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: Clock,
}

const statusColors = {
  pending: 'text-yellow-500',
  processing: 'text-blue-500',
  shipped: 'text-purple-500',
  delivered: 'text-green-500',
  cancelled: 'text-red-500',
}

export default function OrdersPage({ params }: OrdersPageProps) {
  const [locale, setLocale] = useState<Locale>('lv')
  
  useEffect(() => {
    Promise.resolve(params).then(p => setLocale(p.locale as Locale))
  }, [params])

  const t = labels[locale]
  const orders: any[] = [] // Will be populated from API

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <Link
          href={`/${locale}/account`}
          className="inline-flex items-center gap-2 text-lago-muted hover:text-lago-gold transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.back}
        </Link>
        <h1 className="text-4xl md:text-5xl font-heading text-white mb-3">{t.title}</h1>
        <p className="text-lago-muted text-lg">{t.subtitle}</p>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-lago-dark rounded-xl border border-white/10 p-12 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-lago-muted opacity-30" />
          <h3 className="text-xl font-heading text-white mb-2">{t.noOrders}</h3>
          <p className="text-lago-muted mb-6">
            {locale === 'lv' 
              ? 'Jūsu pasūtījumu vēsture parādīsies šeit' 
              : locale === 'en' 
                ? 'Your order history will appear here' 
                : 'История заказов появится здесь'}
          </p>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-lago-gold text-lago-black font-button font-semibold rounded-lg hover:bg-lago-gold-light transition-all"
          >
            {t.startShopping}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Package
            const statusColor = statusColors[order.status as keyof typeof statusColors] || 'text-lago-muted'
            
            return (
              <div
                key={order.id}
                className="bg-lago-dark rounded-xl border border-white/10 p-6 hover:border-lago-gold/30 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full bg-lago-black flex items-center justify-center ${statusColor}`}>
                      <StatusIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {t.orderNumber} {order.order_number}
                      </p>
                      <p className="text-lago-muted text-sm">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-lago-muted text-sm">{t.status}</p>
                      <p className={`font-medium ${statusColor}`}>
                        {t[order.status as keyof typeof t] || order.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lago-muted text-sm">{t.total}</p>
                      <p className="text-white font-medium">
                        €{order.total_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
