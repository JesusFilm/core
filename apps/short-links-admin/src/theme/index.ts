'use client'

import { createTheme } from '@mui/material/styles'

import {
  dataDisplayCustomizations,
  dataGridCustomizations,
  feedbackCustomizations,
  inputsCustomizations,
  navigationCustomizations,
  surfacesCustomizations
} from './customizations'
import { designTokens } from './themePrimitives'

export const theme = createTheme({
  ...designTokens,
  components: {
    ...dataGridCustomizations,
    ...inputsCustomizations,
    ...dataDisplayCustomizations,
    ...feedbackCustomizations,
    ...navigationCustomizations,
    ...surfacesCustomizations
  }
})
