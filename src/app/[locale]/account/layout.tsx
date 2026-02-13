import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Locale, locales } from '@/lib/i18n/config'

interface AccountLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function AccountLayout({
  children,
  params,
}: AccountLayoutProps) {
  const { locale } = await params

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    redirect(`/${locales[0]}/account`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to home if not authenticated
  if (!user) {
    redirect(`/${locale}`)
  }

  return (
    <div className="min-h-screen bg-lago-black pt-24 pb-16">
      <div className="container-lg">
        {children}
      </div>
    </div>
  )
}
