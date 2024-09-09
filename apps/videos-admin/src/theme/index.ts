'use client'

import { createTheme } from '@mui/material/styles'

import {
  chartsCustomizations,
  dataDisplayCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  feedbackCustomizations,
  inputsCustomizations,
  navigationCustomizations,
  surfacesCustomizations,
  treeViewCustomizations
} from './customizations'
import { designTokens } from './themePrimitives'

export const theme = createTheme({
  ...designTokens,
  components: {
    ...chartsCustomizations,
    ...dataGridCustomizations,
    ...datePickersCustomizations,
    ...treeViewCustomizations,
    ...inputsCustomizations,
    ...inputsCustomizations,
    ...dataDisplayCustomizations,
    ...feedbackCustomizations,
    ...navigationCustomizations,
    ...surfacesCustomizations
  }
})
