'use client'

import { createTheme } from '@mui/material/styles'

import getDashboardTheme from './getDashboardTheme'

export const theme = createTheme(getDashboardTheme('light'))
