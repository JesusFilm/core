import { Story, Meta } from '@storybook/react'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName, ThemeMode } from '@core/shared/ui/themes'
import { watchConfig } from '../../../../libs/storybook'
import { videos } from '../../testData'
import { VideosGridCard } from '.'

const VideosGridCardStory = {
  ...watchConfig,
  component: VideosGridCard,
  title: 'Watch/Videos/Grid/Card'
}

const Template: Story = ({ ...args }) => {
  return (
    <ThemeProvider themeMode={ThemeMode.light} themeName={ThemeName.website}>
      <VideosGridCard video={args.video} routePrefix="jesus" />
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

export default VideosGridCardStory as Meta
