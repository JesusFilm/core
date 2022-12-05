import { Story, Meta } from '@storybook/react'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName, ThemeMode } from '@core/shared/ui/themes'
import { watchConfig } from '../../../libs/storybook'
import { videos } from '../testData'
import { VideosGrid } from '.'

const VideosGridStory = {
  ...watchConfig,
  component: VideosGrid,
  title: 'Watch/Videos/Grid'
}

const Template: Story = ({ ...args }) => {
  return (
    <ThemeProvider themeMode={ThemeMode.light} themeName={ThemeName.website}>
      <VideosGrid videos={args.videos} />
    </ThemeProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  videos: videos
}

export default VideosGridStory as Meta
