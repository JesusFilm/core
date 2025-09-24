import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { Badge } from '@ui/components/badge'

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
      <Box>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ display: 'block', mb: 3 }}
        >
          {title}
        </Typography>
        <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
          {Array.from({ length: 6 }).map((_, index) => (
            <Badge
              key={index}
              variant="outline"
              className="opacity-50 cursor-not-allowed px-3 py-1 rounded-full font-medium"
            >
              Loading...
            </Badge>
          ))}
        </Stack>
      </Box>
    )
  }

  if (!Array.isArray(items) || items.length === 0) return null

  return (
    <Box>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ display: 'block', mb: 3 }}
      >
        {title}
      </Typography>
      <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
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
      </Stack>
    </Box>
  )
}
