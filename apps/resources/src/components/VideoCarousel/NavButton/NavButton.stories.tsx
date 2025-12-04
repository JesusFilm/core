import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { watchConfig } from '../../../libs/storybook'

import { NavButton } from './NavButton'

const NavButtonStory: Meta<typeof NavButton> = {
  ...watchConfig,
  component: NavButton,
  title: 'Watch/VideoCarousel/NavButton',
  parameters: {
    docs: {
      source: { type: 'code' }
    }
  }
}

const Template: StoryObj<typeof NavButton> = {
  render: () => {
    return (
      <ThemeProvider
        nested
        themeName={ThemeName.website}
        themeMode={ThemeMode.dark}
      >
        <Box sx={{ position: 'relative', height: 200 }}>
          <NavButton variant="prev" />
          <NavButton variant="next" />
        </Box>
      </ThemeProvider>
    )
  }
}

export const Default = { ...Template }

export default NavButtonStory
