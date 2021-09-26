import { ReactElement } from 'react'
import { Story, Meta } from '@storybook/react'
import { Box } from '@mui/system'
import {
  ThemeProvider,
  useTheme,
  PaletteColor,
  PaletteMode,
  PaletteOptions,
  Typography,
  TypographyProps
} from '@mui/material'

import { sharedUiConfig } from '../storybook/decorators'
import { baseDark, baseLight } from './themes'
import { TypographyVariant } from '../../../__generated__/globalTypes'

const TypographyDemo = {
  ...sharedUiConfig,
  component: Typography,
  title: 'Default Theme'
}

interface ColorPaletteProps extends TypographyProps {
  variants: Array<keyof PaletteOptions>
}

interface TypographyStoryProps extends TypographyProps {
  variants: Array<keyof PaletteOptions>
  mode: PaletteMode
}

const ColorPalettes = ({
  variants,
  ...props
}: ColorPaletteProps): ReactElement => {
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
          mb: theme.space.lg,
          p: theme.space.lg,
          boxShadow: theme.shadows[1]
        }}
      >
        <Typography {...props} variant={TypographyVariant.overline}>
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
                mb: theme.space.lg
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  bgcolor: paletteColor.light,
                  color: paletteColor.contrastText,
                  p: theme.space.lg
                }}
              >
                <Typography {...props} variant={TypographyVariant.overline}>
                  {`${variant} light`}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: '100%',
                  bgcolor: paletteColor.main,
                  color: paletteColor.contrastText,
                  p: theme.space.lg
                }}
              >
                <Typography {...props} variant={TypographyVariant.overline}>
                  {`${variant} main`}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: '100%',
                  bgcolor: paletteColor.dark,
                  color: paletteColor.contrastText,
                  p: theme.space.lg
                }}
              >
                <Typography {...props} variant={TypographyVariant.overline}>
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

const ColorTemplate: Story<TypographyStoryProps> = (args) => (
  // TODO: Update when adding Storybook theme toggle
  <ThemeProvider theme={args.mode === 'dark' ? baseDark : baseLight}>
    <ColorPalettes {...args} variants={args.variants} />
  </ThemeProvider>
)

export const Colors = ColorTemplate.bind({})
Colors.args = {
  mode: 'light',
  variants: ['surface', 'surfaceAlt', 'primary', 'secondary', 'error']
}

export default TypographyDemo as Meta
