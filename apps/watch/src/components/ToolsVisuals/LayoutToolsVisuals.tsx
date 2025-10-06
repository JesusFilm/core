import type { ReactElement, ReactNode } from 'react'
import { useState } from 'react'

import { twMerge } from 'tailwind-merge'

import { AppSidebar } from './AppSidebar'

export interface LayoutToolsVisualsProps {
  children: ReactNode
  className?: string
  showAllPanels?: boolean
}

export function LayoutToolsVisuals({
  children,
  className,
  showAllPanels = true
}: LayoutToolsVisualsProps): ReactElement {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div
        className={twMerge(
          'bg-sidebar border-r transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <AppSidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      {/* Main content */}
      <div className="flex-1">
        <main
          className={twMerge(
            'min-h-screen bg-background p-4',
            // Conditional grid layout based on showAllPanels
            showAllPanels ? [
              'grid gap-6',
              'grid-cols-1', // Mobile: stacked
              'md:grid-cols-[minmax(0,1fr)_minmax(0,360px)_minmax(0,1fr)]', // Desktop: three columns
            ] : [
              'flex justify-center items-start min-h-screen',
              'py-8', // Add some vertical padding for better spacing
            ],
            className
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

