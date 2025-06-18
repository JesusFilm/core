import { ThemeOptions } from '@mui/material/styles'

// Update the Typography's variant prop options
declare module '@mui/material/styles' {
  interface TypographyPropsVariantOverrides {
    button: false
  }
}

// https://mui.com/material-ui/customization/typography/#adding-amp-disabling-variants
declare module '@mui/material/styles' {
  interface TypographyVariants {
    subtitle3: React.CSSProperties
    overline2: React.CSSProperties
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    subtitle3?: React.CSSProperties
    overline2?: React.CSSProperties
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    subtitle3: true
    overline2: true
  }
}

export const adminTypography: Pick<ThemeOptions, 'typography'> = {
  typography: {
    fontFamily: [
      '"Montserrat", "Open Sans", "Tahoma", "Verdana", sans-serif'
    ].join(','),
    h1: {
      fontWeight: 500,
      fontSize: 32,
      lineHeight: '36px'
    },
    h2: {
      fontWeight: 500,
      fontSize: 30,
      lineHeight: '33px'
    },
    h3: {
      fontWeight: 600,
      fontSize: 27,
      lineHeight: '32px'
    },
    h4: {
      fontWeight: 600,
      fontSize: 24,
      lineHeight: '30px'
    },
    h5: {
      fontWeight: 600,
      fontSize: 22,
      lineHeight: '27px'
    },
    h6: {
      fontWeight: 600,
      fontSize: 20,
      lineHeight: '24px',
      letterSpacing: 0
    },
    subtitle1: {
      fontWeight: 600,
      fontSize: 18,
      lineHeight: '24px'
    },
    subtitle2: {
      fontWeight: 600,
      fontSize: 16,
      lineHeight: '21px'
    },
    subtitle3: {
      fontSize: 14,
      fontWeight: 600,
      lineHeight: '19px',
      fontFamily: '"Montserrat", "Open Sans", "Tahoma", "Verdana", sans-serif'
    },
    body1: {
      fontFamily: '"Open Sans", "Tahoma", "Verdana", sans-serif',
      fontWeight: 400,
      fontSize: 16,
      lineHeight: '24px'
    },
    body2: {
      fontFamily: '"Open Sans", "Tahoma", "Verdana", sans-serif',
      fontWeight: 400,
      fontSize: 14,
      lineHeight: '22px'
    },
    overline: {
      fontWeight: 600,
      fontSize: 11,
      lineHeight: '16px',
      letterSpacing: 3,
      textTransform: 'uppercase'
    },
    overline2: {
      fontWeight: 600,
      fontSize: 10,
      lineHeight: '16px',
      letterSpacing: 1,
      textTransform: 'uppercase',
      fontFamily: '"Montserrat", "Open Sans", "Tahoma", "Verdana", sans-serif'
    },
    caption: {
      fontFamily: '"Open Sans", "Tahoma", "Verdana", sans-serif',
      fontWeight: 400,
      fontSize: 12,
      lineHeight: '18px'
    }
  }
}
