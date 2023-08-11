import Box from '@mui/material/Box'
import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { watchConfig } from '../../../libs/storybook'

import { NavButton } from './NavButton'

const NavButtonStory: Meta = {
  ...watchConfig,
  component: NavButton,
  title: 'Watch/VideoCarousel/NavButton'
}

const Template: Story<ComponentProps<typeof NavButton>> = () => {
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

export const Default = Template.bind({})

export default NavButtonStory
