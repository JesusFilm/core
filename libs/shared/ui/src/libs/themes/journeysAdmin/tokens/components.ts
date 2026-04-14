import { ThemeOptions } from '@mui/material/styles'

import { palette } from './colors'

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    blockContained: true
    blockOutlined: true
  }
}

export const adminComponents: Required<Pick<ThemeOptions, 'components'>> = {
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 800,
          borderRadius: '12px',
          textTransform: 'none'
        },
        contained: {
          boxShadow: 'none'
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px'
          }
        }
      },
      variants: [
        {
          props: { size: 'small' },
          style: {
            fontWeight: 600
          }
        },
        {
          props: { variant: 'blockContained' as const },
          style: {
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '18px',
            fontWeight: 700,
            lineHeight: '20px',
            minHeight: '48px',
            boxShadow: 'none',
            backgroundColor: 'var(--variant-containedBg)',
            color: 'var(--variant-containedColor)',
            '&.MuiButton-loading': {
              color: 'transparent'
            },
            '& .MuiButton-loadingIndicator': {
              color: 'var(--variant-containedColor)'
            },
            '&.Mui-disabled': {
              backgroundColor: 'rgba(0, 0, 0, 0.12)'
            },
            '&.Mui-disabled:not(.MuiButton-loading)': {
              color: palette[700]
            }
          }
        },
        {
          props: {
            variant: 'blockContained' as const,
            size: 'small' as const
          },
          style: {
            padding: '6px 10px',
            fontSize: '14px',
            minHeight: '36px'
          }
        },
        {
          props: {
            variant: 'blockContained' as const,
            size: 'large' as const
          },
          style: {
            padding: '12px 20px',
            fontSize: '20px',
            minHeight: '56px'
          }
        },
        {
          props: {
            variant: 'blockContained' as const,
            color: 'solid' as const
          },
          style: {
            '--variant-containedBg': palette[900],
            '--variant-containedColor': palette[0],
            '@media (hover: hover)': {
              '&:hover': {
                '--variant-containedBg': palette[800]
              }
            }
          }
        },
        {
          props: { variant: 'blockOutlined' as const },
          style: {
            borderRadius: '8px',
            padding: '8px 14px',
            fontSize: '18px',
            fontWeight: 700,
            lineHeight: '20px',
            minHeight: '48px',
            border: '2px solid var(--variant-outlinedBorder, currentColor)',
            backgroundColor: palette[0],
            '&.MuiButton-loading': {
              color: 'transparent'
            },
            '& .MuiButton-loadingIndicator': {
              color: 'var(--variant-outlinedColor, currentColor)'
            },
            '&.Mui-disabled': {
              borderColor: 'rgba(0, 0, 0, 0.12)',
              backgroundColor: palette[0]
            },
            '&.Mui-disabled:not(.MuiButton-loading)': {
              color: palette[700]
            }
          }
        },
        {
          props: {
            variant: 'blockOutlined' as const,
            size: 'small' as const
          },
          style: {
            padding: '4px 10px',
            fontSize: '14px',
            minHeight: '36px'
          }
        },
        {
          props: {
            variant: 'blockOutlined' as const,
            size: 'large' as const
          },
          style: {
            padding: '10px 18px',
            fontSize: '20px',
            minHeight: '56px'
          }
        },
        {
          props: {
            variant: 'blockOutlined' as const,
            color: 'solid' as const
          },
          style: {
            '--variant-outlinedBorder': palette[700],
            '--variant-outlinedColor': palette[900],
            color: palette[900],
            '@media (hover: hover)': {
              '&:hover': {
                '--variant-outlinedBorder': palette[900],
                backgroundColor: palette[0]
              }
            }
          }
        }
      ]
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: 'none'
        }
      }
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0
      },
      styleOverrides: {
        colorDefault: {
          backgroundColor: palette[0]
        }
      }
    },
    MuiToolbar: {
      defaultProps: {
        variant: 'dense'
      },
      styleOverrides: {
        dense: {
          maxHeight: 48,
          paddingLeft: 24,
          paddingRight: 24,
          borderBottom: '1px solid',
          borderColor: palette[200]
        }
      }
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontWeight: 600,
          fontFamily: "'Montserrat', sans-serif"
        },
        secondary: {
          color: palette[800]
        }
      }
    },
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
          subtitle3: 'h6',
          body1: 'p',
          body2: 'p',
          overline: 'span',
          overline2: 'span',
          caption: 'span'
        }
      }
    }
  }
}
