'use client'

// ===================================
// TrackingInfo Component - Carrier/tracking display
// ===================================

import { Truck, ExternalLink, MapPin, Calendar } from 'lucide-react'
import type { Order, TrackingInfo as TrackingInfoType } from '@/types/orders'
import { formatDate } from '@/types/orders'

interface TrackingInfoProps {
  order: Order
}

// Common carrier tracking URLs
const CARRIER_TRACKING_URLS: Record<string, (trackingNumber: string) => string> = {
  dhl: (num) => `https://www.dhl.com/en/express/tracking.html?AWB=${num}&brand=DHL`,
  fedex: (num) => `https://www.fedex.com/apps/fedextrack/?tracknumbers=${num}`,
  ups: (num) => `https://www.ups.com/track?tracknum=${num}`,
  usps: (num) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${num}`,
  tnt: (num) => `https://www.tnt.com/express/en_us/site/tracking.html?searchType=con&cons=${num}`,
  aramex: (num) => `https://www.aramex.com/track?ShipmentNumber=${num}`,
  dpd: (num) => `https://www.dpd.com/tracking?reference=${num}`,
  gls: (num) => `https://gls-group.eu/EE/en/parcel-tracking?match=${num}`,
}

function getTrackingUrl(carrier: string, trackingNumber: string): string {
  const normalizedCarrier = carrier.toLowerCase().replace(/[^a-z]/g, '')
  const urlBuilder = CARRIER_TRACKING_URLS[normalizedCarrier]
  
  if (urlBuilder) {
    return urlBuilder(trackingNumber)
  }
  
  // Fallback: try to use the tracking_url from order or construct a search URL
  return `https://www.google.com/search?q=${encodeURIComponent(`${carrier} tracking ${trackingNumber}`)}`
}

export function TrackingInfo({ order }: TrackingInfoProps) {
  const tracking = order.tracking

  if (!tracking) {
    return null
  }

  const trackingUrl = tracking.tracking_url || getTrackingUrl(tracking.carrier, tracking.tracking_number)

  return (
    <div className="bg-lago-charcoal/50 border border-lago-gray/30 rounded-lg p-6">
      <h3 className="text-lg font-medium text-lago-white mb-4">Shipping Information</h3>

      <div className="space-y-4">
        {/* Carrier Info */}
        <div className="flex items-start gap-4 p-4 bg-lago-dark/50 rounded-lg border border-lago-gray/20">
          <div className="w-12 h-12 rounded-full bg-lago-gold/10 flex items-center justify-center flex-shrink-0">
            <Truck className="w-6 h-6 text-lago-gold" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-lago-white font-medium">{tracking.carrier}</h4>
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-lago-gold hover:text-lago-gold-light 
                           text-sm transition-colors"
              >
                Track
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            
            <div className="mt-2 space-y-1">
              <p className="text-lago-light font-mono text-sm">
                {tracking.tracking_number}
              </p>
              
              {tracking.shipped_at && (
                <div className="flex items-center gap-2 text-sm text-lago-muted">
                  <Calendar className="w-4 h-4" />
                  <span>Shipped on {formatDate(tracking.shipped_at)}</span>
                </div>
              )}
              
              {tracking.estimated_delivery && (
                <div className="flex items-center gap-2 text-sm text-lago-gold">
                  <MapPin className="w-4 h-4" />
                  <span>
                    Estimated delivery: {formatDate(tracking.estimated_delivery)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Track Button */}
        <a
          href={trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 
                     bg-lago-gold/10 hover:bg-lago-gold/20 border border-lago-gold/30 
                     rounded-lg text-lago-gold font-medium transition-colors"
        >
          <Truck className="w-4 h-4" />
          Track Your Package
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  )
}

// Compact version for order cards
export function TrackingInfoCompact({ tracking }: { tracking: TrackingInfoType }) {
  const trackingUrl = tracking.tracking_url || getTrackingUrl(tracking.carrier, tracking.tracking_number)

  return (
    <div className="flex items-center gap-2 text-sm">
      <Truck className="w-4 h-4 text-lago-gold" />
      <span className="text-lago-muted">{tracking.carrier}</span>
      <span className="text-lago-light font-mono">{tracking.tracking_number}</span>
      <a
        href={trackingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-lago-gold hover:text-lago-gold-light inline-flex items-center gap-1"
      >
        Track
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  )
}
