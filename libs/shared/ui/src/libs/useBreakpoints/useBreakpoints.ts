import { Breakpoint, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

export const useBreakpoints = (): { [key in Breakpoint]: boolean } => {
  const theme = useTheme()

  // Update if we need to SSR
  // https://mui.com/components/use-media-query/#server-side-rendering
  return {
    xs: useMediaQuery(theme.breakpoints.up('xs'), { noSsr: true }),
    sm: useMediaQuery(theme.breakpoints.up('sm'), { noSsr: true }),
    md: useMediaQuery(theme.breakpoints.up('md'), { noSsr: true }),
    lg: useMediaQuery(theme.breakpoints.up('lg'), { noSsr: true }),
    xl: useMediaQuery(theme.breakpoints.up('xl'), { noSsr: true }),
    xxl: useMediaQuery(theme.breakpoints.up('xxl'), { noSsr: true })
  }
}
