import { ReactElement, ReactNode } from 'react'
import {
  ThemeProvider as MuiThemeProvider,
  createTheme
} from '@mui/material/styles'

interface ThemeProviderProps {
  children: ReactNode
}

export const theme = createTheme({
  palette: {
    primary: {
      main: '#EF3340',
      light: '#F8485E',
      dark: '#A4343A'
    },
    secondary: {
      main: '#424A66',
      light: '#E7E9E9',
      dark: '#4D4D4D'
    },
    background: {
      default: '#FFFFFF',
      paper: '#F3EEEE'
    },
    text: {
      primary: '#252424',
      secondary: '#4D4D4D',
      disabled: '#4D4D4D'
    }
  },
  typography: {
    fontFamily: ['"Apercu"'].join(','),
    h1: {
      fontWeight: 700,
      fontSize: 80,
      lineHeight: '86px',
      letterSpacing: -3
    },
    h2: {
      fontWeight: 700,
      fontSize: 64,
      lineHeight: '64px'
    },
    h3: {
      fontWeight: 700,
      fontSize: 48,
      lineHeight: '48px'
    },
    h4: {
      fontWeight: 700,
      fontSize: 36,
      lineHeight: '36px'
    },
    h5: {
      fontWeight: 700,
      fontSize: 24,
      lineHeight: '24px'
    },
    h6: {
      fontWeight: 700,
      fontSize: 21,
      lineHeight: '21px'
    },
    subtitle1: {
      fontWeight: 400,
      fontSize: 20,
      lineHeight: '27px'
    },
    subtitle2: {
      fontWeight: 700,
      fontSize: 18,
      lineHeight: '18px'
    },
    body1: {
      fontSize: 16,
      fontWeight: 400,
      lineHeight: '21px'
    },
    body2: {
      fontSize: 14,
      fontWeight: 400,
      lineHeight: '20px'
    },
    overline: {
      fontSize: 18,
      fontWeight: 700,
      lineHeight: '32px',
      letterSpacing: '0.12em',
      textTransform: 'uppercase'
    },
    caption: {
      fontSize: 14,
      fontWeight: 700,
      lineHeight: '17px',
      letterSpacing: '0.14em',
      textTransform: 'uppercase'
    }
  }
})

export const ThemeProvider = ({
  children
}: ThemeProviderProps): ReactElement => {
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
}
