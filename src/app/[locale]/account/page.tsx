'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User, Mail, Phone, ShoppingBag, MapPin, ChevronRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { Locale } from '@/lib/i18n/config'

interface AccountPageProps {
  params: Promise<{ locale: Locale }>
}

const labels = {
  lv: {
    title: 'Mans konts',
    subtitle: 'Pārvaldiet savu profilu un iestatījumus',
    profile: 'Profila informācija',
    email: 'E-pasts',
    phone: 'Tālrunis',
    firstName: 'Vārds',
    lastName: 'Uzvārds',
    edit: 'Rediģēt',
    save: 'Saglabāt',
    cancel: 'Atcelt',
    orders: 'Mani pasūtījumi',
    addresses: 'Manas adreses',
    viewAll: 'Skatīt visus',
    addNew: 'Pievienot jaunu',
    noOrders: 'Vēl nav pasūtījumu',
    noAddresses: 'Vēl nav pievienotu adrešu',
    loading: 'Ielāde...',
  },
  en: {
    title: 'My Account',
    subtitle: 'Manage your profile and settings',
    profile: 'Profile Information',
    email: 'Email',
    phone: 'Phone',
    firstName: 'First Name',
    lastName: 'Last Name',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    orders: 'My Orders',
    addresses: 'My Addresses',
    viewAll: 'View all',
    addNew: 'Add new',
    noOrders: 'No orders yet',
    noAddresses: 'No addresses added yet',
    loading: 'Loading...',
  },
  ru: {
    title: 'Мой аккаунт',
    subtitle: 'Управляйте своим профилем и настройками',
    profile: 'Информация профиля',
    email: 'Email',
    phone: 'Телефон',
    firstName: 'Имя',
    lastName: 'Фамилия',
    edit: 'Редактировать',
    save: 'Сохранить',
    cancel: 'Отмена',
    orders: 'Мои заказы',
    addresses: 'Мои адреса',
    viewAll: 'Смотреть все',
    addNew: 'Добавить',
    noOrders: 'Пока нет заказов',
    noAddresses: 'Пока нет адресов',
    loading: 'Загрузка...',
  },
}

export default function AccountPage({ params }: AccountPageProps) {
  // We need to handle params as a Promise per Next.js 15 requirements
  const [locale, setLocale] = useState<Locale>('lv')
  
  // Resolve params
  Promise.resolve(params).then(p => setLocale(p.locale as Locale))
  
  const { user, profile, isLoading: authLoading } = useAuth()
  const { updateUserProfile, isLoading: profileLoading } = useProfile(locale)
  
  const [isEditing, setIsEditing] = useState(false)
  const [firstName, setFirstName] = useState(profile?.first_name || '')
  const [lastName, setLastName] = useState(profile?.last_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')

  const t = labels[locale]
  const isLoading = authLoading || profileLoading

  // Update local state when profile changes
  useState(() => {
    if (profile) {
      setFirstName(profile.first_name || '')
      setLastName(profile.last_name || '')
      setPhone(profile.phone || '')
    }
  })

  const handleSave = async () => {
    const { error } = await updateUserProfile({
      first_name: firstName,
      last_name: lastName,
      phone: phone,
    })
    if (!error) {
      setIsEditing(false)
    }
  }

  const paths = {
    orders: `/${locale}/account/orders`,
    addresses: `/${locale}/account/addresses`,
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-heading text-white mb-3">{t.title}</h1>
        <p className="text-lago-muted text-lg">{t.subtitle}</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-lago-gold animate-spin" />
          <span className="ml-3 text-lago-muted">{t.loading}</span>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Info Card */}
            <div className="bg-lago-dark rounded-xl border border-white/10 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-lago-gold/10 border border-lago-gold/30 flex items-center justify-center">
                    <User className="w-6 h-6 text-lago-gold" />
                  </div>
                  <h2 className="text-xl font-heading text-white">{t.profile}</h2>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-sm font-button text-lago-gold hover:text-lago-gold-light border border-lago-gold/30 hover:border-lago-gold/50 rounded-lg transition-all"
                  >
                    {t.edit}
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-lago-light mb-2">
                        {t.firstName || 'Vārds'}
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-lago-black border border-white/10 text-white focus:border-lago-gold/50 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-lago-light mb-2">
                        {t.lastName || 'Uzvārds'}
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-lago-black border border-white/10 text-white focus:border-lago-gold/50 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-lago-light mb-2">
                      {t.email}
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 rounded-lg bg-lago-black border border-white/10 text-lago-muted cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-lago-light mb-2">
                      {t.phone}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+371 20000000"
                      className="w-full px-4 py-3 rounded-lg bg-lago-black border border-white/10 text-white focus:border-lago-gold/50 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSave}
                      disabled={profileLoading}
                      className="px-6 py-2.5 bg-lago-gold text-lago-black font-button font-semibold rounded-lg hover:bg-lago-gold-light transition-all disabled:opacity-50"
                    >
                      {profileLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.save}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setFirstName(profile?.first_name || '')
                        setLastName(profile?.last_name || '')
                        setPhone(profile?.phone || '')
                      }}
                      className="px-6 py-2.5 text-lago-light hover:text-white border border-white/20 hover:border-white/40 rounded-lg transition-all"
                    >
                      {t.cancel}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 py-3 border-b border-white/5">
                    <User className="w-5 h-5 text-lago-gold" />
                    <div>
                      <p className="text-xs text-lago-muted uppercase tracking-wider">{t.firstName}</p>
                      <p className="text-white">
                        {profile?.first_name && profile?.last_name 
                          ? `${profile.first_name} ${profile.last_name}` 
                          : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 py-3 border-b border-white/5">
                    <Mail className="w-5 h-5 text-lago-gold" />
                    <div>
                      <p className="text-xs text-lago-muted uppercase tracking-wider">{t.email}</p>
                      <p className="text-white">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 py-3">
                    <Phone className="w-5 h-5 text-lago-gold" />
                    <div>
                      <p className="text-xs text-lago-muted uppercase tracking-wider">{t.phone}</p>
                      <p className="text-white">{profile?.phone || '-'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Orders Preview */}
            <div className="bg-lago-dark rounded-xl border border-white/10 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-lago-gold/10 border border-lago-gold/30 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-lago-gold" />
                  </div>
                  <h2 className="text-xl font-heading text-white">{t.orders}</h2>
                </div>
                <Link
                  href={paths.orders}
                  className="flex items-center gap-1 text-sm text-lago-gold hover:text-lago-gold-light transition-colors"
                >
                  {t.viewAll}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="py-8 text-center text-lago-muted">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{t.noOrders}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Addresses Card */}
            <div className="bg-lago-dark rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-lago-gold/10 border border-lago-gold/30 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-lago-gold" />
                </div>
                <h2 className="text-lg font-heading text-white">{t.addresses}</h2>
              </div>

              <div className="py-6 text-center text-lago-muted">
                <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm mb-4">{t.noAddresses}</p>
                <Link
                  href={paths.addresses}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-button text-lago-gold border border-lago-gold/30 rounded-lg hover:bg-lago-gold/10 transition-all"
                >
                  {t.addNew}
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-lago-dark rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-heading text-white mb-4">
                {locale === 'lv' ? 'Ātrās saites' : locale === 'en' ? 'Quick Links' : 'Быстрые ссылки'}
              </h3>
              <nav className="space-y-2">
                <Link
                  href={paths.orders}
                  className="flex items-center gap-3 py-2 text-lago-light hover:text-lago-gold transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {t.orders}
                </Link>
                <Link
                  href={paths.addresses}
                  className="flex items-center gap-3 py-2 text-lago-light hover:text-lago-gold transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  {t.addresses}
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
