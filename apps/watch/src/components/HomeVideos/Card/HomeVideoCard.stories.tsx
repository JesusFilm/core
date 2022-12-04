import { Story, Meta } from '@storybook/react'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName, ThemeMode } from '@core/shared/ui/themes'
import { watchConfig } from '../../../libs/storybook'
import { videos } from '../../Videos/testData'
import { HomeVideoCard } from '.'

const HomeVideoCardStory = {
  ...watchConfig,
  component: HomeVideoCard,
  title: 'Watch/HomeVideoCard'
}

const Template: Story = ({ ...args }) => {
  return (
    <ThemeProvider themeMode={ThemeMode.dark} themeName={ThemeName.website}>
      <HomeVideoCard video={args.video} />
    </ThemeProvider>
  )
}

export const Standalone = Template.bind({})
Standalone.args = {
  video: videos[0]
}

export const Playlist = Template.bind({})
Playlist.args = {
  video: videos[8]
}

export default HomeVideoCardStory as Meta
