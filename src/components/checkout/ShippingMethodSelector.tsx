// ===================================
// Shipping Method Selector Component
// ===================================

'use client'

import { useState, useEffect } from 'react'
import { Truck, Package, MapPin, Store } from 'lucide-react'
import { NeonButton } from '@/components/ui/NeonButton'
import type { ShippingMethod, ShippingRate, ParcelLocker } from '@/types/checkout'
import type { Locale } from '@/lib/i18n/config'

interface ShippingMethodSelectorProps {
  locale: Locale
  country: string
  subtotal: number
  onSelect: (method: ShippingMethod, rate: ShippingRate, locker?: ParcelLocker) => void
  onBack: () => void
  selectedMethodId?: string
}

const translations = {
  title: {
    lv: 'Izvēlieties piegādes veidu',
    en: 'Select Shipping Method',
    ru: 'Выберите способ доставки',
  },
  lockerRequired: {
    lv: 'Izvēlieties pakomātu',
    en: 'Select a parcel locker',
    ru: 'Выберите почтомат',
  },
  free: {
    lv: 'Bezmaksas',
    en: 'Free',
    ru: 'Бесплатно',
  },
  from: {
    lv: 'no',
    en: 'from',
    ru: 'от',
  },
  estimatedDelivery: {
    lv: 'Paredzamais piegādes laiks',
    en: 'Estimated delivery',
    ru: 'Ожидаемая доставка',
  },
  selectLocker: {
    lv: 'Izvēlēties pakomātu',
    en: 'Select Locker',
    ru: 'Выбрать почтомат',
  },
  selectedLocker: {
    lv: 'Izvēlētais pakomāts',
    en: 'Selected Locker',
    ru: 'Выбранный почтомат',
  },
  continue: {
    lv: 'Turpināt uz maksājumu',
    en: 'Continue to Payment',
    ru: 'Перейти к оплате',
  },
  back: {
    lv: 'Atpakaļ',
    en: 'Back',
    ru: 'Назад',
  },
  loading: {
    lv: 'Ielādē piegādes iespējas...',
    en: 'Loading shipping options...',
    ru: 'Загрузка вариантов доставки...',
  },
}

const carrierIcons: Record<string, React.ReactNode> = {
  omniva: <Package className="w-5 h-5" />,
  dpd: <Truck className="w-5 h-5" />,
  latvijas_pasts: <MapPin className="w-5 h-5" />,
  pickup: <Store className="w-5 h-5" />,
}

export function ShippingMethodSelector({
  locale,
  country,
  subtotal,
  onSelect,
  onBack,
  selectedMethodId,
}: ShippingMethodSelectorProps) {
  const t = (key: keyof typeof translations) => translations[key][locale]
  
  const [rates, setRates] = useState<ShippingRate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null)
  const [selectedLocker, setSelectedLocker] = useState<ParcelLocker | null>(null)
  const [showLockerSelector, setShowLockerSelector] = useState(false)
  const [lockers, setLockers] = useState<ParcelLocker[]>([])
  const [lockersLoading, setLockersLoading] = useState(false)

  // Fetch shipping rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch(`/api/shipping/rates?country=${country}&subtotal=${subtotal}`)
        const data = await response.json()
        setRates(data.rates || [])
        
        // Auto-select first method if none selected
        if (data.rates?.length > 0 && !selectedRate) {
          const preselected = selectedMethodId 
            ? data.rates.find((r: ShippingRate) => r.method === selectedMethodId)
            : data.rates[0]
          if (preselected) {
            setSelectedRate(preselected)
          }
        }
      } catch (error) {
        console.error('Error fetching rates:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRates()
  }, [country, subtotal, selectedMethodId])

  // Fetch lockers when locker-compatible method selected
  useEffect(() => {
    if (selectedRate?.lockerCompatible) {
      fetchLockers()
    }
  }, [selectedRate])

  const fetchLockers = async () => {
    if (!selectedRate) return
    
    setLockersLoading(true)
    try {
      const carrier = selectedRate.carrier
      const response = await fetch(`/api/shipping/lockers?carrier=${carrier}&country=${country}`)
      const data = await response.json()
      setLockers(data.lockers || [])
    } catch (error) {
      console.error('Error fetching lockers:', error)
    } finally {
      setLockersLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    if (price === 0) return t('free')
    return new Intl.NumberFormat(
      locale === 'en' ? 'en-US' : locale === 'ru' ? 'ru-RU' : 'lv-LV',
      { style: 'currency', currency: 'EUR' }
    ).format(price)
  }

  const handleRateSelect = (rate: ShippingRate) => {
    setSelectedRate(rate)
    setSelectedLocker(null)
    
    if (rate.lockerCompatible) {
      setShowLockerSelector(true)
    }
  }

  const handleLockerSelect = (locker: ParcelLocker) => {
    setSelectedLocker(locker)
    setShowLockerSelector(false)
  }

  const handleContinue = () => {
    if (!selectedRate) return

    const method: ShippingMethod = {
      id: selectedRate.method,
      carrier: selectedRate.carrier,
      name: selectedRate.name,
      nameLocalized: { lv: selectedRate.name, en: selectedRate.name, ru: selectedRate.name },
      price: selectedRate.price,
      estimatedDays: selectedRate.estimatedDelivery,
      isExpress: false,
      requiresLocker: selectedRate.lockerCompatible,
    }

    onSelect(method, selectedRate, selectedLocker || undefined)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-lago-gold/30 border-t-lago-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lago-muted">{t('loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-white">{t('title')}</h2>

      {/* Shipping Methods */}
      <div className="space-y-3">
        {rates.map((rate) => (
          <button
            key={rate.method}
            onClick={() => handleRateSelect(rate)}
            className={`
              w-full p-4 rounded-xl border-2 text-left transition-all
              ${selectedRate?.method === rate.method
                ? 'border-lago-gold bg-lago-gold/10'
                : 'border-lago-gray/30 bg-lago-charcoal/30 hover:border-lago-gray/50'
              }
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`
                  p-2 rounded-lg
                  ${selectedRate?.method === rate.method
                    ? 'bg-lago-gold/20 text-lago-gold'
                    : 'bg-lago-dark text-lago-muted'
                  }
                `}>
                  {carrierIcons[rate.carrier] || <Truck className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-medium text-white">{rate.name}</h3>
                  <p className="text-sm text-lago-muted mt-1">
                    {t('estimatedDelivery')}: {rate.estimatedDelivery}
                  </p>
                  {rate.lockerCompatible && selectedRate?.method === rate.method && selectedLocker && (
                    <p className="text-sm text-lago-gold mt-2">
                      {t('selectedLocker')}: {selectedLocker.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className={`
                  text-lg font-medium
                  ${rate.price === 0 ? 'text-green-400' : 'text-white'}
                `}>
                  {formatPrice(rate.price)}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Locker Selector */}
      {selectedRate?.lockerCompatible && (
        <div className="mt-4">
          {!selectedLocker ? (
            <button
              onClick={() => setShowLockerSelector(true)}
              className="w-full p-4 rounded-xl border-2 border-dashed border-lago-gray/50 hover:border-lago-gold/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-lago-gold" />
                <span className="text-lago-light">{t('selectLocker')}</span>
              </div>
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-lago-gold/10 border border-lago-gold/30">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-lago-gold mb-1">{t('selectedLocker')}</p>
                  <p className="font-medium text-white">{selectedLocker.name}</p>
                  <p className="text-sm text-lago-muted">{selectedLocker.address}</p>
                  <p className="text-sm text-lago-muted">{selectedLocker.city}, {selectedLocker.postalCode}</p>
                </div>
                <button
                  onClick={() => setShowLockerSelector(true)}
                  className="text-sm text-lago-gold hover:underline"
                >
                  Change
                </button>
              </div>
            </div>
          )}

          {/* Locker Modal */}
          {showLockerSelector && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
              <div className="w-full max-w-lg bg-lago-charcoal rounded-xl border border-lago-gray/30 max-h-[80vh] flex flex-col">
                <div className="p-4 border-b border-lago-gray/30">
                  <h3 className="text-lg font-medium text-white">{t('selectLocker')}</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {lockersLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-lago-gold/30 border-t-lago-gold rounded-full animate-spin mx-auto" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {lockers.map((locker) => (
                        <button
                          key={locker.id}
                          onClick={() => handleLockerSelect(locker)}
                          className="w-full p-3 rounded-lg bg-lago-dark hover:bg-lago-gray/50 text-left transition-colors"
                        >
                          <p className="font-medium text-white">{locker.name}</p>
                          <p className="text-sm text-lago-muted">{locker.address}</p>
                          <p className="text-sm text-lago-muted">{locker.city}, {locker.postalCode}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-lago-gray/30">
                  <NeonButton
                    onClick={() => setShowLockerSelector(false)}
                    variant="outline"
                    className="w-full"
                  >
                    {t('back')}
                  </NeonButton>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <NeonButton
          onClick={onBack}
          variant="outline"
          className="flex-1"
        >
          {t('back')}
        </NeonButton>
        <NeonButton
          onClick={handleContinue}
          variant="solid"
          className="flex-1"
          disabled={!selectedRate || (selectedRate.lockerCompatible && !selectedLocker)}
        >
          {t('continue')}
        </NeonButton>
      </div>
    </div>
  )
}
