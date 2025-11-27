'use client'

import { useState } from 'react'

import { Header, MobileMenu, Sidebar } from '@/components/Dashboard'
import { type ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleMenuClick = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden lg:flex lg:w-64 lg:flex-shrink-0">
        <Sidebar />
      </aside>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={handleCloseMobileMenu} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={handleMenuClick} />

        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
      </div>
    </div>
  )
}
