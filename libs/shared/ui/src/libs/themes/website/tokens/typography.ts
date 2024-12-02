import { ThemeOptions } from '@mui/material/styles'

import { baseBreakpoints } from '../../base/tokens/breakpoints'

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

// Converts pixel to rem
// px divided by base fontsize returns rem
const pxToRem = (pixel: number, fontSize: number): number => pixel / fontSize

export const typography = {
  fontFamily: ['"Montserrat", "Arial", sans-serif'].join(','),
  h1: {
    fontWeight: 700,
    fontSize: 36,
    lineHeight: pxToRem(40, 36),
    [baseBreakpoints.breakpoints.up('md')]: {
      fontSize: 80,
      lineHeight: pxToRem(86, 80),
      letterSpacing: -3
    }
  },

  h2: {
    fontWeight: 700,
    fontSize: 27,
    lineHeight: pxToRem(33, 36),
    [baseBreakpoints.breakpoints.up('md')]: {
      lineHeight: pxToRem(67, 64),
      fontSize: 64,
      letterSpacing: -1
    }
  },
  h3: {
    fontSize: 36,
    fontWeight: 800,
    lineHeight: 1.05,
    [baseBreakpoints.breakpoints.up('md')]: {
      lineHeight: 1.05,
      fontSize: 48
    }
  },
  h4: {
    fontSize: 27,
    fontWeight: 800,
    lineHeight: 1.2,
    [baseBreakpoints.breakpoints.up('md')]: {
      lineHeight: 1.1,
      fontSize: 33
    }
  },
  h5: {
    fontSize: 24,
    fontWeight: 800,
    lineHeight: 1.2,
    marginBottom: '122px',
    [baseBreakpoints.breakpoints.up('md')]: {
      fontSize: 27
    }
  },
  // TODO: H6 on Figma?
  h6: {
    fontWeight: 700,
    fontSize: 21,
    lineHeight: pxToRem(27, 21)
  },
  subtitle1: {
    fontWeight: 500,
    fontSize: 16,
    lineHeight: pxToRem(21, 16),
    [baseBreakpoints.breakpoints.up('md')]: {
      lineHeight: pxToRem(27, 20),
      fontSize: 20
    }
  },
  subtitle2: {
    fontWeight: 500,
    fontSize: 14,
    lineHeight: pxToRem(20, 14),
    [baseBreakpoints.breakpoints.up('md')]: {
      fontWeight: 700,
      lineHeight: pxToRem(21, 18),
      fontSize: 18
    }
  },
  body1: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 1.5
  },
  body2: {
    fontSize: 14,
    fontWeight: 500,
    lineHeight: pxToRem(20, 14)
  },
  // TODO: use same mobile overline styles for both
  overline1: {
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    textWrap: 'balance',
    marginBottom: '12px',
    [baseBreakpoints.breakpoints.up('md')]: {
      lineHeight: 1.2,
      fontSize: 16,
    }
  },
  overline2: {
    fontSize: 14,
    fontWeight: 700,
    lineHeight: pxToRem(17, 14),
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
          overline1: 'p',
          overline2: 'p'
        }
      }
    }
  }
}
