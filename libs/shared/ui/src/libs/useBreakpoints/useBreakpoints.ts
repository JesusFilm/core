import { Breakpoint, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

export const useBreakpoints = (): { [key in Breakpoint]: boolean } => {
  const theme = useTheme()

  return {
    // Mobile Portrait
    xs: useMediaQuery(theme.breakpoints.up('xs')),
    // Mobile Landscape
    sm: useMediaQuery(theme.breakpoints.up('sm')),
    // Tablet Portrait
    md: useMediaQuery(theme.breakpoints.up('md')),
    // Tablet Landscape
    lg: useMediaQuery(theme.breakpoints.up('lg')),
    // Small Desktop / Laptop
    xl: useMediaQuery(theme.breakpoints.up('xl')),
    // Desktop
    xxl: useMediaQuery(theme.breakpoints.up('xxl'))
  }
}
