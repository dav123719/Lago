'use client'

import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'
import { toast } from 'sonner'
import { Locale } from '@/lib/i18n/config'

type Address = Database['public']['Tables']['addresses']['Row']
type AddressInsert = Database['public']['Tables']['addresses']['Insert']

const messages = {
  lv: {
    addressAdded: 'Adrese pievienota',
    addressUpdated: 'Adrese atjaunināta',
    addressDeleted: 'Adrese izdzēsta',
    defaultAddressSet: 'Noklusējuma adrese iestatīta',
    error: 'Kļūda. Lūdzu, mēģiniet vēlreiz.',
  },
  en: {
    addressAdded: 'Address added',
    addressUpdated: 'Address updated',
    addressDeleted: 'Address deleted',
    defaultAddressSet: 'Default address set',
    error: 'Error. Please try again.',
  },
  ru: {
    addressAdded: 'Адрес добавлен',
    addressUpdated: 'Адрес обновлен',
    addressDeleted: 'Адрес удален',
    defaultAddressSet: 'Адрес по умолчанию установлен',
    error: 'Ошибка. Пожалуйста, попробуйте снова.',
  },
}

export function useProfile(locale: Locale = 'lv') {
  const { user, profile, updateProfile, refreshProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createBrowserSupabaseClient()

  // Update user profile
  const updateUserProfile = useCallback(async (updates: Parameters<typeof updateProfile>[0]) => {
    setIsLoading(true)
    try {
      const { error } = await updateProfile(updates)
      if (error) throw error
      toast.success(messages[locale].addressUpdated)
      return { error: null }
    } catch (error) {
      toast.error(messages[locale].error)
      return { error: error as Error }
    } finally {
      setIsLoading(false)
    }
  }, [updateProfile, locale])

  // Get all addresses for current user
  const getAddresses = useCallback(async (): Promise<Address[]> => {
    if (!user?.id) return []

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching addresses:', error)
      return []
    }

    return data || []
  }, [user?.id, supabase])

  // Add new address
  const addAddress = useCallback(async (address: Omit<AddressInsert, 'user_id'>) => {
    if (!user?.id) {
      return { error: new Error('User not authenticated') }
    }

    setIsLoading(true)
    try {
      // If this is the first address or is_default is true, handle default status
      const { data: existingAddresses } = await supabase
        .from('addresses')
        .select('id')
        .eq('user_id', user.id)

      const isFirstAddress = !existingAddresses || existingAddresses.length === 0
      const shouldBeDefault = isFirstAddress || address.is_default

      // If setting this as default, unset others first
      if (shouldBeDefault && !isFirstAddress) {
        await (supabase.from('addresses') as any)
          .update({ is_default: false })
          .eq('user_id', user.id)
      }

      const { data, error } = await (supabase.from('addresses') as any)
        .insert({
          ...address,
          user_id: user.id,
          is_default: shouldBeDefault,
        })
        .select()
        .single()

      if (error) throw error
      toast.success(messages[locale].addressAdded)
      return { data, error: null }
    } catch (error) {
      toast.error(messages[locale].error)
      return { data: null, error: error as Error }
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, supabase, locale])

  // Update address
  const updateAddress = useCallback(async (addressId: string, updates: Partial<Address>) => {
    setIsLoading(true)
    try {
      // If setting as default, unset others first
      if (updates.is_default && user?.id) {
        await (supabase.from('addresses') as any)
          .update({ is_default: false })
          .eq('user_id', user.id)
      }

      const { data, error } = await (supabase.from('addresses') as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', addressId)
        .select()
        .single()

      if (error) throw error
      toast.success(messages[locale].addressUpdated)
      return { data, error: null }
    } catch (error) {
      toast.error(messages[locale].error)
      return { data: null, error: error as Error }
    } finally {
      setIsLoading(false)
    }
  }, [supabase, user?.id, locale])

  // Delete address
  const deleteAddress = useCallback(async (addressId: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)

      if (error) throw error
      toast.success(messages[locale].addressDeleted)
      return { error: null }
    } catch (error) {
      toast.error(messages[locale].error)
      return { error: error as Error }
    } finally {
      setIsLoading(false)
    }
  }, [supabase, locale])

  // Set default address
  const setDefaultAddress = useCallback(async (addressId: string) => {
    if (!user?.id) {
      return { error: new Error('User not authenticated') }
    }

    setIsLoading(true)
    try {
      // Unset all other addresses as default
      await (supabase.from('addresses') as any)
        .update({ is_default: false })
        .eq('user_id', user.id)

      // Set the selected address as default
      const { error } = await (supabase.from('addresses') as any)
        .update({ is_default: true, updated_at: new Date().toISOString() })
        .eq('id', addressId)

      if (error) throw error
      toast.success(messages[locale].defaultAddressSet)
      return { error: null }
    } catch (error) {
      toast.error(messages[locale].error)
      return { error: error as Error }
    } finally {
      setIsLoading(false)
    }
  }, [supabase, user?.id, locale])

  return {
    profile,
    isLoading,
    user,
    updateUserProfile,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refreshProfile,
  }
}
