'use client'
import { PaletteMode, ThemeOptions, createTheme } from '@mui/material/styles'

import {
  dataGridCustomizations,
  inputsCustomizations,
  navigationCustomizations,
  surfacesCustomizations
} from './customizations'
import { getDesignTokens } from './themePrimitives'

function getDashboardTheme(mode: PaletteMode): ThemeOptions {
  return {
    ...getDesignTokens(mode),
    components: {
      // ...chartsCustomizations,
      ...dataGridCustomizations,
      // ...datePickersCustomizations,
      // ...treeViewCustomizations,
      ...inputsCustomizations,
      // ...dataDisplayCustomizations,
      // ...feedbackCustomizations,
      ...navigationCustomizations,
      ...surfacesCustomizations
    }
  }
}

export const theme = {
  light: createTheme(getDashboardTheme('light')),
  dark: createTheme(getDashboardTheme('dark'))
}
