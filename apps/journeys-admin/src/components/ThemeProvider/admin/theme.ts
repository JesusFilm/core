import { createTheme } from '@mui/material'
import { adminColorsLight } from './tokens/colors'
import { adminComponents } from './tokens/components'
import { baseSpacing } from '../../../../../../libs/shared/ui/src/libs/themes/base/tokens/spacing'
import { adminTypography } from './tokens/typography'

export const adminTheme = {
  ...baseSpacing,
  ...adminTypography,
  ...adminComponents,
  ...adminColorsLight
}

// admin only available in light mode
export const adminLight = createTheme(adminTheme)
