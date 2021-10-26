import { Breakpoint, useTheme, useMediaQuery } from '@mui/material'

export const useBreakpoints = (): { [key in Breakpoint]: boolean } => {
  const theme = useTheme()

  return {
    xs: useMediaQuery(theme.breakpoints.only('xs')),
    sm: useMediaQuery(theme.breakpoints.only('sm')),
    md: useMediaQuery(theme.breakpoints.only('md')),
    lg: useMediaQuery(theme.breakpoints.only('lg')),
    xl: useMediaQuery(theme.breakpoints.only('xl'))
  }
}
