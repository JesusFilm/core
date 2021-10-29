import { useMediaQuery } from '@mui/material'
import { Breakpoint, useTheme } from '@mui/material/styles'

export const useBreakpoints = (): { [key in Breakpoint]: boolean } => {
  const theme = useTheme()

  // Update if we need to SSR
  // https://mui.com/components/use-media-query/#server-side-rendering
  return {
    xs: useMediaQuery(theme.breakpoints.only('xs'), { noSsr: true }),
    sm: useMediaQuery(theme.breakpoints.only('sm'), { noSsr: true }),
    md: useMediaQuery(theme.breakpoints.only('md'), { noSsr: true }),
    lg: useMediaQuery(theme.breakpoints.only('lg'), { noSsr: true }),
    xl: useMediaQuery(theme.breakpoints.only('xl'), { noSsr: true })
  }
}
