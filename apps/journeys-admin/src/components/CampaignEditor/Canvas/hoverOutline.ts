import { SimplePaletteColorOptions } from '@mui/material/styles'

import { adminTheme } from '@core/shared/ui/themes/journeysAdmin/theme'

const adminPrimary = adminTheme.palette.primary as SimplePaletteColorOptions

/**
 * The 1 px admin-primary outline of a hoverable canvas element (a section,
 * Extra, column slot, carousel card, journey card or region card, marked
 * `data-hoverable`). CSS hover inside the frame, only on the innermost
 * element under the pointer; the Navigator hovers a row by setting
 * `data-hovered` on the element. The selected element keeps its 2 px outline.
 */
export const HOVER_OUTLINE_SX = {
  '&:not([data-selected="true"]):hover:not(:has([data-hoverable]:hover)), &:not([data-selected="true"])[data-hovered]':
    {
      outline: `1px solid ${adminPrimary.main}`,
      outlineOffset: -1
    }
} as const
