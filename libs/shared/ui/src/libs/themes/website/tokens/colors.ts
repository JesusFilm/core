import {
  ThemeOptions
  // SimplePaletteColorOptions
} from '@mui/material/styles'

// TODO: clarify palette with UX
const palette = {
  0: '#FFFFFF'
}

export const websiteColorsLight: Required<Pick<ThemeOptions, 'palette'>> = {
  palette: {
    mode: 'light',
    background: { default: palette[0] },
    primary: {
      main: '#CB333B',
      light: '#F8485E',
      dark: '#A4343A',
      contrastText: palette[0]
    },
    secondary: {
      main: '#424A66',
      light: '#7283BE',
      dark: '#353C55',
      contrastText: palette[0]
    },
    error: {
      main: '#EF3340',
      contrastText: palette[0]
    },
    text: {
      primary: '#252424',
      secondary: '#4D4D4D',
      disabled: '#AAACBB'
    },
    action: { disabled: '#AAACBB', disabledBackground: '#EFEFEF' }
  }
}

export const websiteColorsDark: Required<Pick<ThemeOptions, 'palette'>> = {
  palette: {
    mode: 'dark',
    background: { default: '#131111', paper: '#303030' },
    primary: websiteColorsLight.palette.primary,
    secondary: {
      main: '#BBBCBC',
      light: '#EDEDED',
      dark: '#939494',
      contrastText: palette[0]
    },
    error: websiteColorsLight.palette.error,
    // TODO: Check this
    text: {
      primary: palette[0],
      secondary: '#4D4D4D',
      disabled: '#4D4D4D'
    }
  }
}
