import { Meta, Story } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName, ThemeMode } from '@core/shared/ui/themes'
import { watchConfig } from '../../../libs/storybook'
import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/testData'
import { VideoHero } from './VideoHero'

const VideoHeroStory = {
  ...watchConfig,
  component: VideoHero,
  title: 'Watch/VideoContentPage/VideoHero'
}

const Template: Story = () => (
  <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.dark}>
    <VideoProvider value={{ content: videos[0] }}>
      <VideoHero />
    </VideoProvider>
  </ThemeProvider>
)

export const Default = Template.bind({})

export const VideoPlayer = Template.bind({})
VideoPlayer.play = async () => {
  const CustomPlayButton = screen.getAllByRole('button')[0]
  userEvent.click(CustomPlayButton)
}

export default VideoHeroStory as Meta
