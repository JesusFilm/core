import { ThemeOptions } from '@mui/material/styles'

const palette = {
  0: 'oklch(21.6% 0.006 56.043)'
}

export const watchColorsDark: Required<Pick<ThemeOptions, 'palette'>> = {
  palette: {
    mode: 'dark',
    background: { default: palette[0] }
  }
}
