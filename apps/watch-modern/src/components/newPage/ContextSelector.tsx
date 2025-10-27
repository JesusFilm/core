import { FileText, Globe, Layers, MessageSquare, Users } from 'lucide-react'
import React from 'react'

interface ContextItem {
  id: string
  label: string
  shortLabel: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  selectedBorderColor: string
  highlightedBorderColor: string
  hoverBorderColor: string
  highlightColor: string
}

interface ContextSelectorProps {
  selectedContext: string
  collapsedTiles: boolean
  isTilesContainerHovered: boolean
  isHovering: boolean
  highlightedCategory: string
  shouldShowHoverEffect: (category: string) => boolean
  handleContextChange: (context: string) => void
  setHoveredCategory: (category: string | null) => void
  setIsHovering: (isHovering: boolean) => void
  setIsTilesContainerHovered: (hovered: boolean) => void
}

const contextItems: ContextItem[] = [
  {
    id: 'Conversations',
    label: 'Conversations',
    shortLabel: 'Talk',
    icon: MessageSquare,
    gradient: 'from-blue-500 via-cyan-600 to-teal-600',
    selectedBorderColor: 'border-cyan-600',
    highlightedBorderColor: 'border-cyan-600',
    hoverBorderColor: 'hover:border-cyan-600',
    highlightColor: 'text-cyan-600'
  },
  {
    id: 'Social Media',
    label: 'Social Media',
    shortLabel: 'Social',
    icon: Layers,
    gradient: 'from-purple-500 via-pink-600 to-red-600',
    selectedBorderColor: 'border-pink-500',
    highlightedBorderColor: 'border-pink-500',
    hoverBorderColor: 'hover:border-pink-500',
    highlightColor: 'text-pink-500'
  },
  {
    id: 'Website',
    label: 'Website',
    shortLabel: 'Web',
    icon: Globe,
    gradient: 'from-orange-500 via-yellow-600 to-amber-600',
    selectedBorderColor: 'border-orange-500',
    highlightedBorderColor: 'border-orange-500',
    hoverBorderColor: 'hover:border-orange-500',
    highlightColor: 'text-orange-500'
  },
  {
    id: 'Print',
    label: 'Print',
    shortLabel: 'Print',
    icon: FileText,
    gradient: 'from-emerald-500 via-green-600 to-lime-600',
    selectedBorderColor: 'border-emerald-500',
    highlightedBorderColor: 'border-emerald-500',
    hoverBorderColor: 'hover:border-emerald-500',
    highlightColor: 'text-emerald-600'
  },
  {
    id: 'Real Life',
    label: 'Real Life',
    shortLabel: 'Live',
    icon: Users,
    gradient: 'from-rose-500 via-pink-600 to-fuchsia-600',
    selectedBorderColor: 'border-rose-500',
    highlightedBorderColor: 'border-rose-500',
    hoverBorderColor: 'hover:border-rose-500',
    highlightColor: 'text-rose-500'
  }
]

export function ContextSelector({
  selectedContext,
  collapsedTiles,
  isTilesContainerHovered,
  isHovering,
  highlightedCategory,
  shouldShowHoverEffect,
  handleContextChange,
  setHoveredCategory,
  setIsHovering,
  setIsTilesContainerHovered
}: ContextSelectorProps) {
  return (
    <div className="mb-8" data-id="ContextSelector">
      <div
        className="grid grid-cols-5 gap-2 md:gap-4"
        data-id="ContextGrid"
        onMouseEnter={() => setIsTilesContainerHovered(true)}
        onMouseLeave={() => setIsTilesContainerHovered(false)}
        suppressHydrationWarning
      >
        {contextItems.map((item) => {
          const Icon = item.icon
          const isSelected = selectedContext === item.id
          const isHighlighted = !isHovering && highlightedCategory === item.id
          const showHover = shouldShowHoverEffect(item.id)

          return (
            <div
              key={item.id}
              data-id={`Tile-${item.id.replace(' ', '')}`}
              className={`${(collapsedTiles && !isTilesContainerHovered) ? 'p-3' : 'p-4'} border-2 rounded-xl transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center ${(collapsedTiles && !isTilesContainerHovered) ? 'gap-1' : 'gap-1 md:gap-3'} ${
                isSelected
                  ? `bg-gradient-to-br ${item.gradient} ${item.selectedBorderColor}`
                  : isHighlighted
                    ? `bg-transparent ${item.highlightedBorderColor}`
                    : `bg-transparent border-gray-300/40 ${
                        showHover
                          ? `hover:bg-gradient-to-br hover:${item.gradient} ${item.hoverBorderColor}`
                          : ''
                      }`
              }`}
              onClick={() => handleContextChange(item.id)}
              onMouseEnter={() => {
                setHoveredCategory(item.id)
                setIsHovering(true)
              }}
              onMouseLeave={() => {
                setHoveredCategory(null)
                setIsHovering(false)
              }}
            >
              {!(collapsedTiles && !isTilesContainerHovered) && (
                <div className="p-1 md:p-3" data-id={`Tile-${item.id.replace(' ', '')}-Icon`}>
                  <Icon
                    className={`w-6 h-6 md:w-8 md:h-8 ${
                      isSelected
                        ? 'text-white drop-shadow-lg'
                        : isHighlighted
                          ? item.highlightColor
                          : 'text-black group-hover:text-white group-hover:drop-shadow-lg'
                    }`}
                  />
                </div>
              )}
              <span
                data-id={`Tile-${item.id.replace(' ', '')}-Label`}
                className={`font-semibold text-sm text-center ${
                  isSelected
                    ? 'text-white drop-shadow-lg'
                    : isHighlighted
                      ? item.highlightColor
                      : 'text-black group-hover:text-white group-hover:drop-shadow-lg'
                }`}
              >
                <span className="inline md:hidden">{item.shortLabel}</span>
                <span className="hidden md:inline">{item.label}</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
