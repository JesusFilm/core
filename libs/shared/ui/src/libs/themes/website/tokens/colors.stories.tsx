import Box from '@mui/material/Box'
import {
  PaletteColor,
  PaletteOptions,
  SimplePaletteColorOptions,
  useTheme
} from '@mui/material/styles'
import Typography, { TypographyProps } from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ReactElement } from 'react'

import { ThemeName } from '../..'
import { simpleComponentConfig } from '../../../simpleComponentConfig'

const ColorsDemo: Meta<typeof Typography> = {
  ...simpleComponentConfig,
  component: Typography,
  title: 'Website Theme',
  parameters: {
    ...simpleComponentConfig.parameters,
    themeName: ThemeName.website,
    theme: 'all'
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
                key={variant}
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
              error main
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
              key={variant}
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

const ColorTemplate: StoryObj<typeof ColorTokens> = {
  render: (args) => <ColorTokens {...args} />
}

export const Colors = {
  ...ColorTemplate,
  args: {
    mainColor: ['light', 'main', 'dark'],
    overrideColors: ['primary', 'secondary', 'error']
  },
  parameters: {
    theme: 'all'
  }
}

export default ColorsDemo
