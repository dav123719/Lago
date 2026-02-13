// ===================================
// Admin Layout - Admin dashboard layout with sidebar
// ===================================

import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { checkAdminRole } from '@/lib/admin/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin | LAGO',
  description: 'LAGO Admin Dashboard',
}

// Admin stats for sidebar badge
async function getPendingOrdersCount(): Promise<number> {
  // This would fetch from your database
  // For now, returning 0 as placeholder
  return 0
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check admin authentication
  const isAdmin = await checkAdminRole()
  
  if (!isAdmin) {
    redirect('/login?redirect=/admin')
  }

  const pendingCount = await getPendingOrdersCount()

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar orderCount={pendingCount} />
      
      {/* Main content - offset for sidebar */}
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
