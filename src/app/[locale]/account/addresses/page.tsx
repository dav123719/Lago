'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Plus, ArrowLeft, Star, Edit2, Trash2, Loader2, Check } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { Locale } from '@/lib/i18n/config'
import { Database } from '@/lib/supabase/database.types'

type Address = Database['public']['Tables']['addresses']['Row']

interface AddressesPageProps {
  params: Promise<{ locale: Locale }>
}

const labels = {
  lv: {
    title: 'Manas adreses',
    subtitle: 'Pārvaldiet savas piegādes adreses',
    back: 'Atpakaļ uz kontu',
    addNew: 'Pievienot jaunu adresi',
    noAddresses: 'Vēl nav pievienotu adrešu',
    addFirst: 'Pievienojiet pirmo adresi',
    default: 'Noklusējuma',
    edit: 'Rediģēt',
    delete: 'Dzēst',
    setDefault: 'Iestatīt kā noklusējuma',
    firstName: 'Vārds',
    firstNamePlaceholder: 'Jānis',
    lastName: 'Uzvārds',
    lastNamePlaceholder: 'Bērziņš',
    phone: 'Tālrunis',
    phonePlaceholder: '+371 20000000',
    street: 'Iela, mājas numurs',
    streetPlaceholder: 'Brīvības iela 123',
    apartment: 'Dzīvoklis (nav obligāti)',
    apartmentPlaceholder: '4. dzīvoklis',
    city: 'Pilsēta',
    cityPlaceholder: 'Rīga',
    postalCode: 'Pasta indekss',
    postalCodePlaceholder: 'LV-1001',
    country: 'Valsts',
    save: 'Saglabāt',
    cancel: 'Atcelt',
    editAddress: 'Rediģēt adresi',
    newAddress: 'Jauna adrese',
    makeDefault: 'Iestatīt kā noklusējuma adresi',
  },
  en: {
    title: 'My Addresses',
    subtitle: 'Manage your delivery addresses',
    back: 'Back to account',
    addNew: 'Add new address',
    noAddresses: 'No addresses added yet',
    addFirst: 'Add your first address',
    default: 'Default',
    edit: 'Edit',
    delete: 'Delete',
    setDefault: 'Set as default',
    firstName: 'First Name',
    firstNamePlaceholder: 'John',
    lastName: 'Last Name',
    lastNamePlaceholder: 'Smith',
    phone: 'Phone',
    phonePlaceholder: '+1 234 567 8900',
    street: 'Street, House number',
    streetPlaceholder: '123 Freedom Street',
    apartment: 'Apartment (optional)',
    apartmentPlaceholder: 'Apt 4',
    city: 'City',
    cityPlaceholder: 'Riga',
    postalCode: 'Postal Code',
    postalCodePlaceholder: 'LV-1001',
    country: 'Country',
    save: 'Save',
    cancel: 'Cancel',
    editAddress: 'Edit Address',
    newAddress: 'New Address',
    makeDefault: 'Set as default address',
  },
  ru: {
    title: 'Мои адреса',
    subtitle: 'Управляйте адресами доставки',
    back: 'Назад в аккаунт',
    addNew: 'Добавить адрес',
    noAddresses: 'Пока нет адресов',
    addFirst: 'Добавьте первый адрес',
    default: 'По умолчанию',
    edit: 'Редактировать',
    delete: 'Удалить',
    setDefault: 'Установить по умолчанию',
    firstName: 'Имя',
    firstNamePlaceholder: 'Иван',
    lastName: 'Фамилия',
    lastNamePlaceholder: 'Иванов',
    phone: 'Телефон',
    phonePlaceholder: '+7 900 000 00 00',
    street: 'Улица, номер дома',
    streetPlaceholder: 'ул. Свободы 123',
    apartment: 'Квартира (необязательно)',
    apartmentPlaceholder: 'кв. 4',
    city: 'Город',
    cityPlaceholder: 'Рига',
    postalCode: 'Почтовый индекс',
    postalCodePlaceholder: 'LV-1001',
    country: 'Страна',
    save: 'Сохранить',
    cancel: 'Отмена',
    editAddress: 'Редактировать адрес',
    newAddress: 'Новый адрес',
    makeDefault: 'Установить как адрес по умолчанию',
  },
}

const defaultFormData = {
  first_name: '',
  last_name: '',
  phone: '',
  street_address: '',
  apartment_suite: '',
  city: '',
  postal_code: '',
  country: 'Latvia',
  type: 'shipping' as 'shipping' | 'billing' | 'both',
  is_default: false,
}

export default function AddressesPage({ params }: AddressesPageProps) {
  const [locale, setLocale] = useState<Locale>('lv')
  
  // Resolve params
  useEffect(() => {
    Promise.resolve(params).then(p => setLocale(p.locale as Locale))
  }, [params])

  const { 
    getAddresses, 
    addAddress, 
    updateAddress, 
    deleteAddress, 
    setDefaultAddress,
    isLoading 
  } = useProfile(locale)
  
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [formData, setFormData] = useState(defaultFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const t = labels[locale]

  // Load addresses
  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = async () => {
    const data = await getAddresses()
    setAddresses(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const addressData = {
      ...formData,
      type: 'shipping' as const,
    }

    if (editingAddress) {
      await updateAddress(editingAddress.id, addressData)
    } else {
      await addAddress(addressData)
    }

    await loadAddresses()
    setIsSubmitting(false)
    setShowForm(false)
    setEditingAddress(null)
    setFormData(defaultFormData)
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setFormData({
      first_name: address.first_name,
      last_name: address.last_name,
      phone: address.phone || '',
      street_address: address.street_address,
      apartment_suite: address.apartment_suite || '',
      city: address.city,
      postal_code: address.postal_code,
      country: address.country,
      type: address.type,
      is_default: address.is_default,
    })
    setShowForm(true)
  }

  const handleDelete = async (addressId: string) => {
    if (window.confirm(locale === 'lv' ? 'Vai tiešām vēlaties dzēst šo adresi?' : 
                       locale === 'en' ? 'Are you sure you want to delete this address?' : 
                       'Вы уверены, что хотите удалить этот адрес?')) {
      await deleteAddress(addressId)
      await loadAddresses()
    }
  }

  const handleSetDefault = async (addressId: string) => {
    await setDefaultAddress(addressId)
    await loadAddresses()
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingAddress(null)
    setFormData(defaultFormData)
  }

  return (
    <div className="min-h-screen bg-lago-black">
      <div className="container-sm py-12 px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/account`}
            className="inline-flex items-center gap-2 text-lago-light/60 hover:text-lago-gold transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.back}
          </Link>
          <h1 className="text-3xl md:text-4xl font-heading text-white mb-2">{t.title}</h1>
          <p className="text-lago-light/60">{t.subtitle}</p>
        </div>

        {/* Add New Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-lago-gold hover:bg-lago-gold-light text-lago-black font-medium rounded-lg transition-all mb-8"
          >
            <Plus className="w-5 h-5" />
            {t.addNew}
          </button>
        )}

        {/* Address Form */}
        {showForm && (
          <div className="bg-lago-charcoal rounded-xl p-6 mb-8 border border-white/5">
            <h2 className="text-xl font-heading text-white mb-6">
              {editingAddress ? t.editAddress : t.newAddress}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-lago-light/80 mb-2">
                    {t.firstName}
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder={t.firstNamePlaceholder}
                    required
                    className="w-full px-4 py-3 bg-lago-black border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-lago-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lago-light/80 mb-2">
                    {t.lastName}
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder={t.lastNamePlaceholder}
                    required
                    className="w-full px-4 py-3 bg-lago-black border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-lago-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-lago-light/80 mb-2">
                  {t.phone}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={t.phonePlaceholder}
                  className="w-full px-4 py-3 bg-lago-black border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-lago-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-lago-light/80 mb-2">
                  {t.street}
                </label>
                <input
                  type="text"
                  value={formData.street_address}
                  onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                  placeholder={t.streetPlaceholder}
                  required
                  className="w-full px-4 py-3 bg-lago-black border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-lago-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-lago-light/80 mb-2">
                  {t.apartment}
                </label>
                <input
                  type="text"
                  value={formData.apartment_suite}
                  onChange={(e) => setFormData({ ...formData, apartment_suite: e.target.value })}
                  placeholder={t.apartmentPlaceholder}
                  className="w-full px-4 py-3 bg-lago-black border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-lago-gold focus:outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-lago-light/80 mb-2">
                    {t.city}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder={t.cityPlaceholder}
                    required
                    className="w-full px-4 py-3 bg-lago-black border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-lago-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lago-light/80 mb-2">
                    {t.postalCode}
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    placeholder={t.postalCodePlaceholder}
                    required
                    className="w-full px-4 py-3 bg-lago-black border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-lago-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-lago-light/80 mb-2">
                  {t.country}
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-lago-black border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-lago-gold focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20 bg-lago-black text-lago-gold focus:ring-lago-gold"
                />
                <label htmlFor="is_default" className="text-lago-light/80">
                  {t.makeDefault}
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-lago-gold hover:bg-lago-gold-light text-lago-black font-medium rounded-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  {t.save}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-white/20 text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Addresses List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-lago-gold" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-12 bg-lago-charcoal rounded-xl border border-white/5">
            <MapPin className="w-12 h-12 text-lago-light/20 mx-auto mb-4" />
            <p className="text-lago-light/60 mb-2">{t.noAddresses}</p>
            <p className="text-white">{t.addFirst}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`bg-lago-charcoal rounded-xl p-6 border ${
                  address.is_default ? 'border-lago-gold/30' : 'border-white/5'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white font-medium">
                        {address.first_name} {address.last_name}
                      </h3>
                      {address.is_default && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-lago-gold/20 text-lago-gold text-xs rounded-full">
                          <Star className="w-3 h-3 fill-current" />
                          {t.default}
                        </span>
                      )}
                    </div>
                    <p className="text-lago-light/80">{address.street_address}</p>
                    {address.apartment_suite && (
                      <p className="text-lago-light/60">{address.apartment_suite}</p>
                    )}
                    <p className="text-lago-light/80">
                      {address.city}, {address.postal_code}
                    </p>
                    <p className="text-lago-light/60">{address.country}</p>
                    {address.phone && (
                      <p className="text-lago-light/60 mt-1">{address.phone}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleEdit(address)}
                      className="p-2 text-lago-light/60 hover:text-lago-gold transition-colors"
                      title={t.edit}
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    {!address.is_default && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="p-2 text-lago-light/60 hover:text-lago-gold transition-colors"
                        title={t.setDefault}
                      >
                        <Star className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="p-2 text-lago-light/60 hover:text-red-400 transition-colors"
                      title={t.delete}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
