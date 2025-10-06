'use client'

import Image from 'next/image'
import type { ReactElement } from 'react'
import { ArrowRight, BookOpen, ChevronLeft, ChevronRight, Crop, Eye, FileText } from 'lucide-react'

import { Button } from '@ui/components/button'

import { cn } from '@ui/lib/utils'

// Menu items for the tools/visuals sidebar
const items = [
  {
    title: 'Video Visuals',
    url: '#visuals',
    icon: Eye,
    id: 'visuals',
  },
  {
    title: 'Video Crop',
    url: '#video-crop',
    icon: Crop,
    id: 'video-crop',
  },
  {
    title: 'Social Stories',
    url: '#stories',
    icon: BookOpen,
    id: 'stories',
  },
  {
    title: 'NextSteps',
    url: '#nextsteps',
    icon: ArrowRight,
    id: 'nextsteps',
  },
  {
    title: 'Video Verses',
    url: '#video-verses',
    icon: FileText,
    id: 'video-verses',
  },
]

interface AppSidebarProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function AppSidebar({ collapsed = false, onToggleCollapse }: AppSidebarProps): ReactElement {
  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <div className={cn(
          'flex items-center gap-4',
          collapsed && 'justify-center'
        )}>
          <Image
            src="/assets/jesusfilm-sign.svg"
            alt="Jesus Film"
            width={36}
            height={36}
            className="flex-shrink-0"
          />
          {!collapsed && (
            <h2 className={cn(
              'text-lg font-semibold text-sidebar-foreground',
              collapsed && 'text-center'
            )}>
              Media Tools
            </h2>
          )}
        </div>
      </div>

      {/* Media Tools Header */}
      <div className={cn(
        'mb-4 pl-2 pt-4',
        collapsed ? 'opacity-0' : 'opacity-100'
      )}>
        <h3 className="text-sm font-medium text-stone-200/40 uppercase tracking-widest">
          {collapsed ? ' ' : 'Media Editing'}
        </h3>
      </div>

      {/* Media Tools Menu */}
      <nav className="space-y-1">
        {items.slice(0, 2).map((item) => (
          <a
            key={item.id}
            href={item.url}
            className={cn(
              'flex items-center gap-2 px-3 py-3 rounded-md text-sidebar-foreground hover:bg-stone-500/10 hover:text-white transition-all duration-200',
              collapsed && 'justify-center px-1'
            )}
          >
            <item.icon className="h-4 w-4 flex-shrink-0 opacity-50" />
            {!collapsed && (
              <div className="flex items-center gap-2 ml-1">
                <span className="text-base">{item.title}</span>
                {item.id === 'video-crop' && (
                  <span className="px-1 py-0.5 text-xs font-bold bg-white text-stone-600 rounded-sm tracking-wide">
                    Nov'25
                  </span>
                )}
              </div>
            )}
          </a>
        ))}
      </nav>

      {/* Sharing Tools Header */}
      <div className={cn(
        'mt-6 mb-4 pl-2 pt-4 transition-opacity duration-200',
        collapsed ? 'opacity-0' : 'opacity-100'
      )}>
        <h3 className="text-sm font-medium text-stone-200/40 uppercase tracking-widest">
          {collapsed ? ' ' : 'Sharing Tools'}
        </h3>
      </div>

      {/* Sharing Tools Menu */}
      <nav className="space-y-1">
        {items.slice(2).map((item) => (
          <a
            key={item.id}
            href={item.url}
            className={cn(
              'flex items-center gap-2 px-3 py-3 rounded-md text-sidebar-foreground hover:bg-stone-500/10 hover:text-white transition-all duration-200',
              collapsed && 'justify-center px-1'
            )}
          >
            <item.icon className="h-4 w-4 flex-shrink-0 opacity-50" />
            {!collapsed && (
              <div className="flex items-center gap-2 ml-1">
                <span className="text-base">{item.title}</span>
                {item.id === 'stories' && (
                  <span className="px-1 py-0.5 text-xs font-bold bg-white text-stone-600 rounded-sm tracking-wide">
                    Oct'25
                  </span>
                )}
                {item.id === 'video-verses' && (
                  <span className="px-1 py-0.5 text-xs font-bold bg-white text-stone-600 rounded-sm tracking-wide">
                    Dec'25
                  </span>
                )}
              </div>
            )}
          </a>
        ))}
      </nav>

      {/* Collapse Button */}
      <div className="mt-8 pt-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            collapsed && 'justify-center px-0'
          )}
          onClick={onToggleCollapse}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Collapse Sidebar
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
