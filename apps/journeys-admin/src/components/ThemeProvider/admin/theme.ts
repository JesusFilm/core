import { createTheme } from '@mui/material'
import { baseColorsLight } from './tokens/colors'
import { baseComponents } from './tokens/components'
import { baseSpacing } from '../../../../../../libs/shared/ui/src/libs/themes/base/tokens/spacing'
import { baseTypography } from './tokens/typography'

export const adminTheme = {
  ...baseSpacing,
  ...baseTypography,
  ...baseComponents,
  ...baseColorsLight
}

// admin only available in light mode
export const adminLight = createTheme(adminTheme)
