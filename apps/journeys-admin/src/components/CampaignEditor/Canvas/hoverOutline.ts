import { SimplePaletteColorOptions } from '@mui/material/styles'

import { adminTheme } from '@core/shared/ui/themes/journeysAdmin/theme'

/** The admin theme's primary colour: the canvas's outlines, badges, handles and drop indicators. */
export const ADMIN_PRIMARY = adminTheme.palette
  .primary as SimplePaletteColorOptions

/**
 * The 1 px admin-primary outline of a hoverable canvas element (a section,
 * Extra, column slot, carousel card, journey card or region card, marked
 * `data-hoverable`). CSS hover inside the frame, only on the innermost
 * element under the pointer; the Navigator hovers a row by setting
 * `data-hovered` on the element. The selected element keeps its 2 px outline.
 * While a badge shows above the element, its top-left corner is squared so
 * the badge sits flush on a rounded card.
 */
export const HOVER_OUTLINE_SX = {
  '&:not([data-selected="true"]):hover:not(:has([data-hoverable]:hover)), &:not([data-selected="true"])[data-hovered]':
    {
      outline: `1px solid ${ADMIN_PRIMARY.main}`,
      outlineOffset: -1
    },
  // A badge sitting on the top edge meets a square corner, not a gap under a rounded one.
  '&:has(> [data-placement="above"])': {
    borderTopLeftRadius: 0
  }
} as const

/** The 2 px admin-primary outline of the selected canvas element. */
export const SELECTED_OUTLINE = {
  outline: `2px solid ${ADMIN_PRIMARY.main}`,
  outlineOffset: -2
}
