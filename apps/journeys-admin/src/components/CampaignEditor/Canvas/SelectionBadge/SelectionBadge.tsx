import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { useCanvasHovered } from '../../CampaignHoverProvider'
import { ADMIN_PRIMARY } from '../hoverOutline'

/**
 * Where the badge sits on its block's top-left corner: `above` the block's
 * top edge, so it never covers the block's own content, or `inside` the
 * corner for a block whose ancestor clips what leaves it (the header, a
 * card in a scroller).
 */
export type SelectionBadgePlacement = 'above' | 'inside'

interface SelectionBadgeProps {
  /** The DOM id of the block the badge belongs to; the canvas hover is matched against it. */
  id?: string
  /** The block's Navigator label. */
  label: string
  selected: boolean
  placement?: SelectionBadgePlacement
  /** The block's own border width in px: the badge is pulled out by it so its edge meets the block's outer edge, not the inside of the border. */
  borderWidth?: number
}

/**
 * The label of a canvas block, on its top-left corner: solid in the admin
 * primary colour while the block is selected, muted while the pointer is
 * over it. The block must be `position: relative`; a block with a border
 * passes its width so the badge sits on the outer edge. It takes no pointer
 * events, so it never gets between the pointer and the block under it.
 */
export function SelectionBadge({
  id,
  label,
  selected,
  placement = 'above',
  borderWidth = 0
}: SelectionBadgeProps): ReactElement | null {
  const hovered = useCanvasHovered(id ?? '')
  if (!selected && !hovered) return null

  return (
    <Box
      component="span"
      aria-hidden
      data-testid="SelectionBadge"
      data-state={selected ? 'selected' : 'hovered'}
      data-placement={placement}
      sx={{
        position: 'absolute',
        top: -borderWidth,
        left: -borderWidth,
        transform: placement === 'above' ? 'translateY(-100%)' : undefined,
        zIndex: selected ? 4 : 3,
        maxWidth: '100%',
        px: 0.75,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        fontFamily: '"Open Sans", "Tahoma", "Verdana", sans-serif',
        fontSize: 11,
        fontWeight: 600,
        lineHeight: '16px',
        textAlign: 'left',
        textTransform: 'none',
        letterSpacing: 0,
        borderRadius: placement === 'above' ? '4px 4px 0 0' : '0 0 4px 0',
        ...(selected
          ? {
              backgroundColor: ADMIN_PRIMARY.main,
              color: ADMIN_PRIMARY.contrastText
            }
          : {
              backgroundColor: ADMIN_PRIMARY.contrastText,
              color: ADMIN_PRIMARY.main,
              boxShadow: `inset 0 0 0 1px ${ADMIN_PRIMARY.main}`
            })
      }}
    >
      {label}
    </Box>
  )
}
