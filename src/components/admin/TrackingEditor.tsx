'use client'

// ===================================
// TrackingEditor Component - Add tracking info
// ===================================

import { useState } from 'react'
import { Truck, ExternalLink, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Order } from '@/types/orders'

interface TrackingEditorProps {
  order: Order
  onAddTracking: (tracking: {
    carrier: string
    tracking_number: string
    tracking_url?: string
    estimated_delivery?: string
  }) => Promise<void>
}

const COMMON_CARRIERS = [
  'DHL',
  'FedEx',
  'UPS',
  'USPS',
  'TNT',
  'Aramex',
  'DPD',
  'GLS',
  'Other',
]

export function TrackingEditor({ order, onAddTracking }: TrackingEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [carrier, setCarrier] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingUrl, setTrackingUrl] = useState('')
  const [estimatedDelivery, setEstimatedDelivery] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const existingTracking = order.tracking

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!carrier || !trackingNumber) {
      setError('Carrier and tracking number are required')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      await onAddTracking({
        carrier,
        tracking_number: trackingNumber,
        tracking_url: trackingUrl || undefined,
        estimated_delivery: estimatedDelivery || undefined,
      })
      setIsEditing(false)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add tracking')
    } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => {
    setCarrier('')
    setTrackingNumber('')
    setTrackingUrl('')
    setEstimatedDelivery('')
    setError(null)
  }

  const getCarrierTrackingUrl = (carrierName: string, number: string): string => {
    const normalizedCarrier = carrierName.toLowerCase().replace(/[^a-z]/g, '')
    
    const urls: Record<string, string> = {
      dhl: `https://www.dhl.com/en/express/tracking.html?AWB=${number}&brand=DHL`,
      fedex: `https://www.fedex.com/apps/fedextrack/?tracknumbers=${number}`,
      ups: `https://www.ups.com/track?tracknum=${number}`,
      usps: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${number}`,
      tnt: `https://www.tnt.com/express/en_us/site/tracking.html?searchType=con&cons=${number}`,
      aramex: `https://www.aramex.com/track?ShipmentNumber=${number}`,
      dpd: `https://www.dpd.com/tracking?reference=${number}`,
      gls: `https://gls-group.eu/EE/en/parcel-tracking?match=${number}`,
    }

    return urls[normalizedCarrier] || ''
  }

  const handleCarrierChange = (value: string) => {
    setCarrier(value)
    // Auto-generate tracking URL for known carriers
    if (trackingNumber && value !== 'Other') {
      const autoUrl = getCarrierTrackingUrl(value, trackingNumber)
      if (autoUrl) {
        setTrackingUrl(autoUrl)
      }
    }
  }

  const handleTrackingNumberChange = (value: string) => {
    setTrackingNumber(value)
    // Auto-generate tracking URL for known carriers
    if (carrier && carrier !== 'Other') {
      const autoUrl = getCarrierTrackingUrl(carrier, value)
      if (autoUrl) {
        setTrackingUrl(autoUrl)
      }
    }
  }

  if (existingTracking && !isEditing) {
    const trackingUrl =
      existingTracking.tracking_url ||
      getCarrierTrackingUrl(existingTracking.carrier, existingTracking.tracking_number)

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Tracking Information</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-lago-gold hover:text-lago-gold-dark font-medium"
          >
            Edit
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-lago-gold/10 flex items-center justify-center">
              <Truck className="w-6 h-6 text-lago-gold" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{existingTracking.carrier}</p>
              <p className="text-sm text-gray-500 font-mono">
                {existingTracking.tracking_number}
              </p>
            </div>
          </div>

          {trackingUrl && (
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 
                       bg-lago-gold/10 hover:bg-lago-gold/20 border border-lago-gold/30 
                       rounded-lg text-lago-gold font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Track Package
            </a>
          )}

          {existingTracking.estimated_delivery && (
            <div className="text-sm text-gray-600">
              <span className="text-gray-500">Estimated delivery:</span>{' '}
              {new Date(existingTracking.estimated_delivery).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {existingTracking ? 'Edit Tracking' : 'Add Tracking'}
        </h3>
        {existingTracking && (
          <button
            onClick={() => {
              setIsEditing(false)
              resetForm()
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Carrier */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Carrier *
          </label>
          <select
            value={carrier}
            onChange={(e) => handleCarrierChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-lago-gold focus:border-transparent"
            required
          >
            <option value="">Select carrier...</option>
            {COMMON_CARRIERS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Tracking Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tracking Number *
          </label>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => handleTrackingNumberChange(e.target.value)}
            placeholder="Enter tracking number"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-lago-gold focus:border-transparent font-mono"
            required
          />
        </div>

        {/* Tracking URL (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tracking URL <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="url"
            value={trackingUrl}
            onChange={(e) => setTrackingUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-lago-gold focus:border-transparent text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Auto-generated for known carriers, or enter custom URL
          </p>
        </div>

        {/* Estimated Delivery */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estimated Delivery <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="date"
            value={estimatedDelivery}
            onChange={(e) => setEstimatedDelivery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-lago-gold focus:border-transparent"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-lago-gold text-white rounded-lg font-medium',
              'hover:bg-lago-gold-dark transition-colors',
              isSaving && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Plus className="w-4 h-4" />
            {isSaving
              ? 'Saving...'
              : existingTracking
                ? 'Update Tracking'
                : 'Add Tracking'}
          </button>
          {existingTracking && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false)
                resetForm()
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg 
                       font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
