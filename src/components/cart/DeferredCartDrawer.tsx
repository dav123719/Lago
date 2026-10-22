'use client'

import dynamic from 'next/dynamic'
import type { Locale } from '@/lib/i18n/config'
import { useCartContext } from '@/contexts/CartContext'

function LoadingDrawer() {
  const { closeCart } = useCartContext()
  return <div className="fixed inset-0 z-50 flex justify-end bg-black/70">
    <button type="button" className="absolute inset-0" onClick={closeCart} aria-label="Close" />
    <div role="status" aria-label="Loading" className="relative flex h-full w-full max-w-md items-center justify-center bg-lago-black"><span className="h-8 w-8 animate-spin rounded-full border-2 border-lago-gold border-t-transparent" /></div>
  </div>
}

const CartDrawer = dynamic(() => import('./CartDrawer').then(module => module.CartDrawer), { loading: LoadingDrawer })

export function DeferredCartDrawer({ locale }: { locale: Locale }) {
  const { isCartOpen } = useCartContext()
  return isCartOpen ? <CartDrawer locale={locale} /> : null
}
