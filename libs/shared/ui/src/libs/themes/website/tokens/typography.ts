import { ThemeOptions } from '@mui/material/styles'

// https://mui.com/material-ui/customization/typography/#adding-amp-disabling-variants
declare module '@mui/material/styles' {
  interface TypographyVariants {
    overline1: React.CSSProperties
    overline2: React.CSSProperties
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    overline1?: React.CSSProperties
    overline2?: React.CSSProperties
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    overline1: true
    overline2: true
    // Disabling unused variants here disables for all themes
    // overline: false
    // caption: false
  }
}

type ValueOf<T> = T[keyof T]

export const typography = {
  fontFamily: ['"Apercu", "Arial", sans-serif'].join(','),
  h1: {
    fontWeight: 700,
    fontSize: 80,
    lineHeight: '86px',
    letterSpacing: -3
  },
  h2: {
    fontWeight: 700,
    fontSize: 64,
    lineHeight: '67px',
    letterSpacing: -1
  },
  h3: {
    fontWeight: 700,
    fontSize: 48,
    lineHeight: '48px'
  },
  h4: {
    fontWeight: 700,
    fontSize: 36,
    lineHeight: '40px'
  },
  h5: {
    fontWeight: 700,
    fontSize: 27,
    lineHeight: '33px'
  },
  h6: {
    fontWeight: 700,
    fontSize: 21,
    lineHeight: '27px'
  },
  subtitle1: {
    fontWeight: 400,
    fontSize: 20,
    lineHeight: '27px'
  },
  subtitle2: {
    fontWeight: 700,
    fontSize: 18,
    lineHeight: '21px'
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
  overline1: {
    fontSize: 18,
    fontWeight: 700,
    lineHeight: '28px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase'
  },
  overline2: {
    fontSize: 14,
    fontWeight: 700,
    lineHeight: '17px',
    letterSpacing: '0.14em',
    textTransform: 'uppercase'
  }
}

export const websiteTypography: Pick<
  ThemeOptions,
  'typography' | 'components'
> = {
  typography: typography as ValueOf<Pick<ThemeOptions, 'typography'>>,
  components: {
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          h1: 'h1',
          h2: 'h2',
          h3: 'h3',
          h4: 'h4',
          h5: 'h5',
          h6: 'h6',
          subtitle1: 'h6',
          subtitle2: 'h6',
          body1: 'p',
          body2: 'p',
          overline1: 'span',
          overline2: 'span'
        }
      }
    }
  }
}
