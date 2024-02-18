import { Theme, createTheme } from '@mui/material/styles'

import { adminColorsLight } from './tokens/colors'
import { adminComponents } from './tokens/components'
import { adminSpacing } from './tokens/spacing'
import { adminTypography } from './tokens/typography'

export const adminTheme = {
  ...adminColorsLight,
  ...adminComponents,
  ...adminTypography,
  ...adminSpacing
}

interface ThemeProps {
  rtl: boolean
}

// admin only available in light mode
export const getTheme = ({ rtl }: ThemeProps): Theme => {
  return createTheme({ ...adminTheme, direction: rtl ? 'rtl' : 'ltr' })
}
