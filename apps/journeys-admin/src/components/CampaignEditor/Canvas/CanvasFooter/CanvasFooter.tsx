import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import type { CanvasBlock } from '../canvasBlock'

/** The footer's lines (text) and links (buttons): what its row shows. */
export function footerRows(block: CanvasBlock): {
  lines: CanvasBlock[]
  links: CanvasBlock[]
} {
  return {
    lines: block.children.filter(
      (child) => child.__typename === 'CampaignTypographyBlock'
    ),
    links: block.children.filter(
      (child) => child.__typename === 'CampaignButtonBlock'
    )
  }
}

interface CanvasFooterProps {
  /** The footer block. */
  block: CanvasBlock
  /** Renders one of its lines or links, selectable and editable in place. */
  renderExtra: (child: CanvasBlock) => ReactElement | null
}

/** The footer row as the public `CampaignFooter` lays it out: lines left, links right, stacked below `md`; nothing while it has neither. */
export function CanvasFooter({
  block,
  renderExtra
}: CanvasFooterProps): ReactElement | null {
  const { lines, links } = footerRows(block)
  if (lines.length === 0 && links.length === 0) return null

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={{ xs: 2, md: 4 }}
      data-testid="CanvasFooterRow"
      sx={{
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between'
      }}
    >
      {lines.length > 0 && (
        <Stack spacing={0.5} data-testid="CanvasFooterLines">
          {lines.map(renderExtra)}
        </Stack>
      )}
      {links.length > 0 && (
        <Box
          component="nav"
          data-testid="CanvasFooterLinks"
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 1, md: 2 }
          }}
        >
          {links.map(renderExtra)}
        </Box>
      )}
    </Stack>
  )
}
