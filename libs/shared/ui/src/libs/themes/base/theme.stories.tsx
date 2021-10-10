import { ReactElement } from 'react'
import { Story, Meta } from '@storybook/react'
import { Box } from '@mui/system'
import {
  useTheme,
  PaletteColor,
  PaletteOptions,
  Typography,
  TypographyProps
} from '@mui/material'

import { sharedUiConfig } from '../../storybook/config'

const ThemeDemo = {
  ...sharedUiConfig,
  component: Typography,
  title: 'Default Theme'
}

interface ThemeStoryProps extends TypographyProps {
  variants: Array<keyof PaletteOptions>
}

const ColorPalettes = ({
  variants,
  ...props
}: ThemeStoryProps): ReactElement => {
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
          mb: theme.spacing(4),
          p: theme.spacing(4),
          boxShadow: theme.shadows[1]
        }}
      >
        <Typography {...props} variant="overline">
          Background
        </Typography>
      </Box>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {variants.map((variant: keyof PaletteOptions) => {
          const paletteColor = theme.palette[variant] as PaletteColor
          return (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                mb: theme.spacing(4)
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  bgcolor: paletteColor.light,
                  color: paletteColor.contrastText,
                  p: theme.spacing(4)
                }}
              >
                <Typography {...props} variant="overline" gutterBottom>
                  {`${variant} light`}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: '100%',
                  bgcolor: paletteColor.main,
                  color: paletteColor.contrastText,
                  p: theme.spacing(4)
                }}
              >
                <Typography {...props} variant="overline">
                  {`${variant} main`}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: '100%',
                  bgcolor: paletteColor.dark,
                  color: paletteColor.contrastText,
                  p: theme.spacing(4)
                }}
              >
                <Typography {...props} variant="overline">
                  {`${variant} dark`}
                </Typography>
              </Box>
            </Box>
          )
        })}
      </div>
    </div>
  )
}

const ColorTemplate: Story<ThemeStoryProps> = (args) => (
  <ColorPalettes {...args} variants={args.variants} />
)

export const Colors = ColorTemplate.bind({})
Colors.args = {
  variants: ['primary', 'secondary', 'error']
}

export default ThemeDemo as Meta
