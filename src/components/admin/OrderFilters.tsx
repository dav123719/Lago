'use client'

// ===================================
// OrderFilters Component - Filter controls
// ===================================

import { useState } from 'react'
import { Search, X, Filter, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OrderFilters as OrderFiltersType, OrderStatus } from '@/types/orders'
import { ORDER_STATUS_CONFIG } from '@/types/orders'

interface OrderFiltersProps {
  filters: OrderFiltersType
  onFiltersChange: (filters: OrderFiltersType) => void
}

export function OrderFilters({ filters, onFiltersChange }: OrderFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)

  const handleSearchChange = (value: string) => {
    const newFilters = { ...localFilters, search: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleStatusChange = (status: OrderStatus | 'all') => {
    const newFilters = { ...localFilters, status }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleDateChange = (field: 'dateFrom' | 'dateTo', value: string) => {
    const newFilters = { ...localFilters, [field]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleSortChange = (sortBy: OrderFiltersType['sortBy']) => {
    const newSortOrder: 'asc' | 'desc' =
      localFilters.sortBy === sortBy && localFilters.sortOrder === 'desc'
        ? 'asc'
        : 'desc'
    const newFilters = { ...localFilters, sortBy, sortOrder: newSortOrder }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const cleared: OrderFiltersType = {
      status: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc',
    }
    setLocalFilters(cleared)
    onFiltersChange(cleared)
  }

  const hasActiveFilters =
    localFilters.status !== 'all' ||
    localFilters.dateFrom ||
    localFilters.dateTo ||
    localFilters.search

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      {/* Search and Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={localFilters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search orders, customers..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-lago-gold focus:border-transparent text-sm"
          />
          {localFilters.search && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors',
            isExpanded
              ? 'border-lago-gold text-lago-gold bg-lago-gold/5'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          )}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-lago-gold" />
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 
                     hover:bg-gray-100 rounded-lg transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="pt-4 border-t border-gray-200 space-y-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusChange('all')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  localFilters.status === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                All
              </button>
              {(Object.keys(ORDER_STATUS_CONFIG) as OrderStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                    localFilters.status === status
                      ? `${ORDER_STATUS_CONFIG[status].bgColor} ${ORDER_STATUS_CONFIG[status].color}`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {ORDER_STATUS_CONFIG[status].label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={localFilters.dateFrom || ''}
                  onChange={(e) => handleDateChange('dateFrom', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-lago-gold focus:border-transparent text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={localFilters.dateTo || ''}
                  onChange={(e) => handleDateChange('dateTo', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-lago-gold focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'created_at', label: 'Date' },
                { value: 'total', label: 'Total' },
                { value: 'status', label: 'Status' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value as OrderFiltersType['sortBy'])}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    localFilters.sortBy === option.value
                      ? 'bg-lago-gold text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {option.label}
                  {localFilters.sortBy === option.value && (
                    <span className="ml-1">
                      {localFilters.sortOrder === 'desc' ? '↓' : '↑'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
