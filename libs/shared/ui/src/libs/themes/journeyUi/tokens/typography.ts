import { ThemeOptions } from '@mui/material/styles'

import {
  baseTypography,
  baseTypographyArabic,
  baseTypographyUrdu
} from '../../base/tokens/typography'

// should match base values until we have a need for different values

declare module '@mui/material/styles' {
  interface TypographyPropsVariantOverrides {
    button: false
  }
}

export const journeyUiTypography: Pick<ThemeOptions, 'typography'> = {
  typography: {
    ...baseTypography.typography,
    subtitle1: {
      fontFamily: '"Open Sans"',
      fontSize: 12,
      fontWeight: 600,
      lineHeight: '18px',
      fontFeatureSettings: '"clig" off, "liga"'
    },
    subtitle2: {
      fontFamily: '"Open Sans"',
      fontSize: 10,
      fontWeight: 600,
      lineHeight: '15px',
      fontFeatureSettings: '"clig" off, "liga"'
    },
    body2: {
      fontFamily: '"Open Sans"',
      fontSize: 14,
      fontWeight: 400,
      lineHeight: '22px'
    },
    caption: {
      fontFamily: '"Open Sans"',
      fontSize: 12,
      fontWeight: 400,
      lineHeight: '18px'
    }
  }
}

export const journeyUiTypographyArabic: Pick<ThemeOptions, 'typography'> = {
  typography: {
    ...baseTypographyArabic.typography,
    subtitle1: {
      fontSize: 12,
      fontWeight: 600,
      lineHeight: '18px'
    },
    subtitle2: {
      fontSize: 10,
      fontWeight: 600,
      lineHeight: '15px'
    },
    body2: {
      fontSize: 14,
      fontWeight: 400,
      lineHeight: '22px'
    },
    caption: {
      fontSize: 12,
      fontWeight: 400,
      lineHeight: '18px'
    }
  }
}

export const journeyUiTypographyUrdu: Pick<ThemeOptions, 'typography'> = {
  typography: {
    ...baseTypographyUrdu.typography,
    subtitle1: {
      fontSize: 12,
      fontWeight: 600,
      lineHeight: '18px'
    },
    subtitle2: {
      fontSize: 10,
      fontWeight: 600,
      lineHeight: '15px'
    },
    body2: {
      fontSize: 14,
      fontWeight: 400,
      lineHeight: '22px'
    },
    caption: {
      fontSize: 12,
      fontWeight: 400,
      lineHeight: '18px'
    }
  }
}
