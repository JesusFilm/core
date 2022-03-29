import { ReactElement } from 'react'
import { Story, Meta } from '@storybook/react'
import {
  useTheme,
  PaletteColor,
  PaletteOptions,
  SimplePaletteColorOptions
} from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography, { TypographyProps } from '@mui/material/Typography'
import { journeysAdminConfig } from '../../../libs/storybook'

const AdminThemeDemo = {
  ...journeysAdminConfig,
  component: Typography,
  title: 'Admin Theme',
  parameters: {
    ...journeysAdminConfig.parameters,
    chromatic: {
      ...journeysAdminConfig.parameters.chromatic,
      viewports: [600]
    }
  }
}

interface ColorStoryProps extends Omit<TypographyProps, 'css'> {
  mainColor: Array<keyof SimplePaletteColorOptions>
  overrideColors: Array<keyof PaletteOptions>
}

const ColorTokens = ({
  mainColor,
  overrideColors
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
        <Typography variant="overline">App Background</Typography>
        <Typography
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
        <Typography variant="overline">Container Background</Typography>
        <Typography
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
        <Typography variant="overline">Color tokens</Typography>
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
                key={variant}
                sx={{
                  width: '100%',
                  bgcolor: paletteColor[variant],
                  color: paletteColor.contrastText,
                  p: theme.spacing(3)
                }}
              >
                <Typography
                  sx={{ display: 'flex', justifyContent: 'flex-end' }}
                  variant="caption"
                >
                  {`primary ${variant}`}
                </Typography>
              </Box>
            )
          })}
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          {mainColor.map((variant: keyof SimplePaletteColorOptions) => {
            const paletteColor = theme.palette.secondary
            return (
              <Box
                key={variant}
                sx={{
                  width: '100%',
                  bgcolor: paletteColor[variant],
                  color: paletteColor.contrastText,
                  p: theme.spacing(3)
                }}
              >
                <Typography
                  sx={{ display: 'flex', justifyContent: 'flex-end' }}
                  variant="caption"
                >
                  {`secondary ${variant}`}
                </Typography>
              </Box>
            )
          })}
        </Box>
      </div>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="overline">Feedback & other colors</Typography>
        {overrideColors.map((variant: keyof PaletteOptions) => {
          const paletteColor = theme.palette[variant] as PaletteColor
          return (
            <Box
              key={variant}
              sx={{
                width: '100%',
                bgcolor: paletteColor.main,
                color: paletteColor.contrastText,
                p: theme.spacing(3)
              }}
            >
              <Typography variant="overline">{`${variant}`}</Typography>
            </Box>
          )
        })}
        <Box
          sx={{
            width: '100%',
            bgcolor: theme.palette.divider,
            color: theme.palette.text.primary,
            p: theme.spacing(3)
          }}
        >
          <Typography variant="overline">Divider</Typography>
        </Box>
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
  overrideColors: ['error', 'warning', 'success']
}
Colors.parameters = {
  theme: 'all'
}

// Make sure this is consistent with palette in colors.ts
const palette: Record<string, string> = {
  error: '#B62D1C',
  success: '#3AA74A',
  warning: '#F0720C',
  900: '#26262E',
  800: '#444451',
  700: '#6D6D7D',
  200: '#DEDFE0',
  100: '#EFEFEF',
  0: '#FFFFFF'
}

interface ThemeStoryProps extends Omit<TypographyProps, 'css'> {
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
            key={variant}
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
            <Typography variant="overline">{`${variant}`}</Typography>
            <Typography variant="overline">{`${palette[variant]}`}</Typography>
          </Box>
        )
      })}
    </div>
  )
}

const PaletteTemplate: Story<ThemeStoryProps> = (args) => (
  <PaletteTokens {...args} />
)

export const FullPalette = PaletteTemplate.bind({})
FullPalette.args = {
  variants: [...Object.keys(palette)]
}

export default AdminThemeDemo as Meta
