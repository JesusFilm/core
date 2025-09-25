<<<<<<< HEAD
=======
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
>>>>>>> 211ca2436 (chore: update pnpm lockfile and refactor component imports)
import { Badge } from '@ui/components/badge'
import { ReactElement } from 'react'

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
        <div className="block mb-3 text-xs uppercase tracking-wider text-gray-600">
          {title}
        </div>
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Badge
              key={index}
              variant="outline"
              className="opacity-50 cursor-not-allowed px-3 py-1 rounded-full font-medium"
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
      <div className="block mb-3 text-xs uppercase tracking-wider text-gray-600">
        {title}
      </div>
      <div className="flex flex-wrap gap-3">
        {items.map((item) => (
          <Badge
            key={item}
            variant="outline"
            className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors px-3 py-1 rounded-full font-medium"
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
