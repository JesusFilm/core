import { ReactElement } from 'react'

import { Badge } from '@core/shared/ui-modern/components/badge'

export interface QuickListProps {
  title: string
  items: string[]
  onSelect: (value: string) => void
  isLoading?: boolean
}

export function QuickList({
  title,
  items,
  onSelect,
  isLoading = false
}: QuickListProps): ReactElement | null {
  if (isLoading) {
    return (
      <div>
        <div className="mb-3 block text-sm font-semibold tracking-wider text-stone-600 uppercase">
          {title}
        </div>
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Badge
              key={index}
              variant="outline"
              className="cursor-not-allowed rounded-full px-4 py-2 font-medium opacity-50"
            >
              Loading...
            </Badge>
          ))}
        </div>
      </div>
    )
  }

  if (!Array.isArray(items) || items.length === 0) return null

  return (
    <div>
      <div className="mb-3 block text-sm font-semibold tracking-wider text-stone-600 uppercase">
        {title}
      </div>
      <div className="flex flex-wrap gap-3">
        {items.map((item) => (
          <Badge
            key={item}
            variant="outline"
            className="hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-full px-4 py-2 font-medium transition-colors"
            onClick={() => onSelect(item)}
            onMouseDown={(event) => event.preventDefault()}
          >
            {item}
          </Badge>
        ))}
      </div>
    </div>
  )
}
