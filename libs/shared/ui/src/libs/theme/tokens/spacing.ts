declare module '@mui/material/styles' {
  interface Theme {
    space: {
      [key: string]: number
    }
  }
  interface ThemeOptions {
    space: {
      [key: string]: number
    }
  }
}

export const baseSpacing = {
  spacing: 4,
  space: { none: 0, sm: 1, md: 2, lg: 4 }
}
