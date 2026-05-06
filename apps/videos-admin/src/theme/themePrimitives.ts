import { alpha, createTheme } from '@mui/material/styles'
import { Inter } from 'next/font/google'

declare module '@mui/material/Paper' {
  interface PaperPropsVariantOverrides {
    highlighted: true
  }
}
declare module '@mui/material/styles/createPalette' {
  interface ColorRange {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
  }

  interface PaletteColor extends ColorRange {}
}

const defaultTheme = createTheme()

export const brand = {
  50: 'hsl(210, 100%, 95%)',
  100: 'hsl(210, 100%, 92%)',
  200: 'hsl(210, 100%, 80%)',
  300: 'hsl(210, 100%, 65%)',
  400: 'hsl(210, 98%, 48%)',
  500: 'hsl(210, 98%, 42%)',
  600: 'hsl(210, 98%, 55%)',
  700: 'hsl(210, 100%, 35%)',
  800: 'hsl(210, 100%, 16%)',
  900: 'hsl(210, 100%, 21%)'
}

export const grey = {
  50: 'hsl(220, 35%, 97%)',
  100: 'hsl(220, 30%, 94%)',
  200: 'hsl(220, 20%, 88%)',
  300: 'hsl(220, 20%, 80%)',
  400: 'hsl(220, 20%, 65%)',
  500: 'hsl(220, 20%, 42%)',
  600: 'hsl(220, 20%, 35%)',
  700: 'hsl(220, 20%, 25%)',
  800: 'hsl(220, 30%, 6%)',
  900: 'hsl(220, 35%, 3%)'
}

export const green = {
  50: 'hsl(120, 80%, 98%)',
  100: 'hsl(120, 75%, 94%)',
  200: 'hsl(120, 75%, 87%)',
  300: 'hsl(120, 61%, 77%)',
  400: 'hsl(120, 44%, 53%)',
  500: 'hsl(120, 59%, 30%)',
  600: 'hsl(120, 70%, 25%)',
  700: 'hsl(120, 75%, 16%)',
  800: 'hsl(120, 84%, 10%)',
  900: 'hsl(120, 87%, 6%)'
}

export const orange = {
  50: 'hsl(45, 100%, 97%)',
  100: 'hsl(45, 92%, 90%)',
  200: 'hsl(45, 94%, 80%)',
  300: 'hsl(45, 90%, 65%)',
  400: 'hsl(45, 90%, 40%)',
  500: 'hsl(45, 90%, 35%)',
  600: 'hsl(45, 91%, 25%)',
  700: 'hsl(45, 94%, 20%)',
  800: 'hsl(45, 95%, 16%)',
  900: 'hsl(45, 93%, 12%)'
}

export const red = {
  50: 'hsl(0, 100%, 97%)',
  100: 'hsl(0, 92%, 90%)',
  200: 'hsl(0, 94%, 80%)',
  300: 'hsl(0, 90%, 65%)',
  400: 'hsl(0, 90%, 40%)',
  500: 'hsl(0, 90%, 30%)',
  600: 'hsl(0, 91%, 25%)',
  700: 'hsl(0, 94%, 18%)',
  800: 'hsl(0, 95%, 12%)',
  900: 'hsl(0, 93%, 6%)'
}

const inter = Inter({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap'
})

export const designTokens: Parameters<typeof createTheme>[0] = {
  colorSchemes: {
    light: {
      palette: {
        primary: {
          light: brand[200],
          main: brand[400],
          dark: brand[700],
          contrastText: brand[50]
        },
        info: {
          light: brand[100],
          main: brand[300],
          dark: brand[600],
          contrastText: grey[50]
        },
        warning: {
          light: orange[300],
          main: orange[400],
          dark: orange[800]
        },
        error: {
          light: red[300],
          main: red[400],
          dark: red[800]
        },
        success: {
          light: green[300],
          main: green[400],
          dark: green[800]
        },
        grey,
        divider: alpha(grey[300], 0.4),
        background: {
          default: 'hsl(0, 0%, 99%)',
          paper: 'hsl(220, 35%, 97%)'
        },
        text: {
          primary: grey[800],
          secondary: grey[600]
        },
        action: {
          hover: alpha(grey[200], 0.2),
          selected: `${alpha(grey[200], 0.3)}`
        }
      }
    },
    dark: {
      palette: {
        primary: {
          contrastText: brand[50],
          light: brand[300],
          main: brand[400],
          dark: brand[700]
        },
        info: {
          contrastText: brand[300],
          light: brand[500],
          main: brand[700],
          dark: brand[900]
        },
        warning: {
          light: orange[400],
          main: orange[500],
          dark: orange[700]
        },
        error: {
          light: red[400],
          main: red[500],
          dark: red[700]
        },
        success: {
          light: green[400],
          main: green[500],
          dark: green[700]
        },
        grey,
        divider: alpha(grey[700], 0.6),
        background: {
          default: grey[900],
          paper: 'hsl(220, 30%, 7%)'
        },
        text: {
          primary: 'hsl(0, 0%, 100%)',
          secondary: grey[400]
        },
        action: {
          hover: alpha(grey[600], 0.2),
          selected: alpha(grey[600], 0.3)
        }
      }
    }
  },
  typography: {
    fontFamily: inter.style.fontFamily,
    h1: {
      fontSize: defaultTheme.typography.pxToRem(48),
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: -0.5
    },
    h2: {
      fontSize: defaultTheme.typography.pxToRem(36),
      fontWeight: 600,
      lineHeight: 1.2
    },
    h3: {
      fontSize: defaultTheme.typography.pxToRem(30),
      lineHeight: 1.2
    },
    h4: {
      fontSize: defaultTheme.typography.pxToRem(24),
      fontWeight: 600,
      lineHeight: 1.5
    },
    h5: {
      fontSize: defaultTheme.typography.pxToRem(20),
      fontWeight: 600
    },
    h6: {
      fontSize: defaultTheme.typography.pxToRem(18),
      fontWeight: 600
    },
    subtitle1: {
      fontSize: defaultTheme.typography.pxToRem(18)
    },
    subtitle2: {
      fontSize: defaultTheme.typography.pxToRem(14),
      fontWeight: 500
    },
    body1: {
      fontSize: defaultTheme.typography.pxToRem(14)
    },
    body2: {
      fontSize: defaultTheme.typography.pxToRem(14),
      fontWeight: 400
    },
    caption: {
      fontSize: defaultTheme.typography.pxToRem(12),
      fontWeight: 400
    }
  },
  shape: {
    borderRadius: 8
  }
}
