'use client'

import { createTheme } from '@mui/material/styles'
import { deepmerge } from '@mui/utils'

import { baseBreakpoints } from '../base/tokens/breakpoints'
import { baseSpacing } from '../base/tokens/spacing'
import { watchColorsDark } from './tokens/colors'
import { watchTypography } from './tokens/typography'
import { websiteComponents } from '../website/tokens/components'

const watchTheme = {
  ...baseSpacing,
  ...baseBreakpoints,
  ...watchTypography,
  ...websiteComponents
}

export const watchDark = createTheme(deepmerge(watchColorsDark, watchTheme))
