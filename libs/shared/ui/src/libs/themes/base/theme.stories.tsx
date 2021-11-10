import { useState, useEffect, ReactElement } from 'react'
import { Story, Meta } from '@storybook/react'
import {
  Box,
  useTheme,
  PaletteColor,
  PaletteOptions,
  Breakpoint,
  Typography,
  TypographyProps,
  SimplePaletteColorOptions
} from '@mui/material'

import { sharedUiConfig, themes, useBreakpoints } from '../../../index'

const ThemeDemo = {
  ...sharedUiConfig,
  component: Typography,
  title: 'Default Theme',
  parameters: {
    theme: 'dark',
    chromatic: {
      viewports: [600]
    }
  }
}

interface ColorStoryProps extends TypographyProps {
  mainColor: Array<keyof SimplePaletteColorOptions>
  overrideColors: Array<keyof PaletteOptions>
}

const ColorTokens = ({
  mainColor,
  overrideColors,
  ...props
}: ColorStoryProps): ReactElement => {
  const theme = useTheme()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box
        sx={{
          bgcolor: theme.palette.background.default,
          color: theme.palette.text.primary,
          p: theme.spacing(3),
          boxShadow: theme.shadows[1]
        }}
      >
        <Typography {...props} variant="overline">
          App Background
        </Typography>
        <Typography
          {...props}
          sx={{ display: 'flex', justifyContent: 'flex-end' }}
          variant="caption"
        >
          background.default
        </Typography>
      </Box>
      <Box
        sx={{
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          mb: theme.spacing(6),
          p: theme.spacing(3),
          boxShadow: theme.shadows[1]
        }}
      >
        <Typography {...props} variant="overline">
          Card Background
        </Typography>
        <Typography
          {...props}
          sx={{ display: 'flex', justifyContent: 'flex-end' }}
          variant="caption"
        >
          background.paper
        </Typography>
      </Box>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '24px'
        }}
      >
        <Typography {...props} variant="overline">
          Color tokens
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          {mainColor.map((variant: keyof SimplePaletteColorOptions) => {
            const paletteColor = theme.palette.primary
            return (
              <Box
                sx={{
                  width: '100%',
                  bgcolor: paletteColor[variant],
                  color: paletteColor.contrastText,
                  p: theme.spacing(3)
                }}
              >
                <Typography
                  {...props}
                  sx={{ display: 'flex', justifyContent: 'flex-end' }}
                  variant="caption"
                >
                  {`primary ${variant}`}
                </Typography>
              </Box>
            )
          })}
          <Box
            sx={{
              width: '100%',
              bgcolor: theme.palette.error.main,
              color: theme.palette.error.contrastText,
              p: theme.spacing(3)
            }}
          >
            <Typography
              {...props}
              sx={{ display: 'flex', justifyContent: 'flex-end' }}
              variant="caption"
            >
              {`error main`}
            </Typography>
          </Box>
        </Box>
      </div>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <Typography {...props} variant="overline">
          Base Component & Text colors
        </Typography>
        {overrideColors.map((variant: keyof PaletteOptions) => {
          const paletteColor = theme.palette[variant] as PaletteColor
          return (
            <Box
              sx={{
                width: '100%',
                bgcolor: paletteColor.main,
                color: paletteColor.contrastText,
                p: theme.spacing(3)
              }}
            >
              <Typography {...props} variant="overline">
                {`${variant} ${variant === 'primary' ? '(Default)' : ''}`}
              </Typography>
            </Box>
          )
        })}
      </Box>
    </div>
  )
}

const ColorTemplate: Story<ColorStoryProps> = (args) => (
  <ColorTokens {...args} />
)

export const Colors = ColorTemplate.bind({})
Colors.args = {
  mainColor: ['light', 'main', 'dark'],
  overrideColors: ['primary', 'secondary', 'error']
}
Colors.parameters = {
  theme: 'all'
}

// Make sure this is consistent with palette in colors.ts
const palette: Record<string, string> = {
  errorLight: '#FC624E',
  errorDark: '#DC3722',
  900: '#26262E',
  800: '#30313D',
  700: '#6D6F81',
  300: '#AAACBB',
  200: '#DCDDE5',
  100: '#FEFEFE',
  0: '#FFFFFF'
}

interface ThemeStoryProps extends TypographyProps {
  variants: string[]
}

const PaletteTokens = ({
  variants,
  ...props
}: ThemeStoryProps): ReactElement => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {variants.map((variant: string) => {
        return (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              bgcolor: palette[variant],
              color:
                Number(variant) < 500 || variant === 'errorLight'
                  ? palette[900]
                  : palette[100],
              p: (theme) => theme.spacing(2)
            }}
          >
            <Typography {...props} variant="overline">
              {`${variant}`}
            </Typography>
            <Typography {...props} variant="overline">
              {`${palette[variant]}`}
            </Typography>
          </Box>
        )
      })}
    </div>
  )
}

const PaletteTemplate: Story<ThemeStoryProps> = (args) => (
  <PaletteTokens {...args} variants={args.variants} />
)

export const FullPalette = PaletteTemplate.bind({})
FullPalette.args = {
  variants: [...Object.keys(palette)]
}

const ViewportTemplate: Story<ThemeStoryProps> = (args) => {
  const theme = useTheme()
  const [width, setWidth] = useState(window.innerWidth)
  const [height, setHeight] = useState(window.innerHeight)
  const breakpoints = useBreakpoints()

  const maxBreakpointValue = (breakpoint: Breakpoint): string => {
    switch (breakpoint) {
      case 'xl':
        return '+'
      default:
        return `${
          theme.breakpoints.values[
            theme.breakpoints.keys[
              theme.breakpoints.keys.indexOf(breakpoint) + 1
            ]
          ] - 1
        }`
    }
  }

  useEffect(() => {
    const updateWidth = (): void => {
      setWidth(window.innerWidth)
      setHeight(window.innerHeight)
    }

    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '600px'
      }}
    >
      {args.variants.map((variant: string) => {
        return (
          <>
            <Typography
              variant="h4"
              sx={{
                [theme.breakpoints.only(variant as Breakpoint)]: {
                  display: 'flex'
                },
                display: 'none'
              }}
            >
              {`sx: theme.breakpoint: ${variant}`}
            </Typography>
            <Typography
              variant="h4"
              align="center"
              style={{
                display: breakpoints[variant as Breakpoint] ? 'flex' : 'none'
              }}
            >
              {`style: useBreakpoint: ${variant}`}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                [theme.breakpoints.only(variant as Breakpoint)]: {
                  display: 'flex'
                },
                display: 'none'
              }}
            >
              {`Range: ${
                theme.breakpoints.values[variant as Breakpoint]
              }-${maxBreakpointValue(variant as Breakpoint)}`}
            </Typography>
          </>
        )
      })}
      <Typography
        variant="body1"
        gutterBottom
      >{`Current width: ${width}px | Current height: ${height}px`}</Typography>
      <Typography
        variant="overline"
        align="center"
        sx={{
          height: '30px',
          color: '#FC624E',
          [theme.breakpoints.up('md')]: {
            color: '#7fe0aa'
          },
          [theme.breakpoints.up('xl')]: {
            color: '#4ec4fc'
          }
        }}
      >
        Mobile - red | Tablet - green | Desktop - blue
      </Typography>
    </Box>
  )
}

const breakpoints = themes.base.light.breakpoints

export const Viewport = ViewportTemplate.bind({})
Viewport.args = {
  // Height of viewport will alter breakpoints display.
  variants: ['xs', 'sm', 'md', 'lg', 'xl']
}
Viewport.parameters = {
  layout: 'fullscreen',
  chromatic: {
    viewports: [
      breakpoints.values.sm - 1,
      breakpoints.values.sm,
      // Change to 960px when Chromatic can configure height
      breakpoints.values.md - 1,
      breakpoints.values.md,
      breakpoints.values.lg - 1,
      breakpoints.values.lg,
      breakpoints.values.xl - 1,
      breakpoints.values.xl
    ]
  }
}

export default ThemeDemo as Meta
