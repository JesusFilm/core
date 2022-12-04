import { Story, Meta } from '@storybook/react'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName, ThemeMode } from '@core/shared/ui/themes'
import { watchConfig } from '../../libs/storybook'
import { videos } from '../Videos/testData'
import { HomeVideos } from '.'

const HomeVideosStory = {
  ...watchConfig,
  component: HomeVideos,
  title: 'Watch/HomeVideos'
}

const Template: Story = ({ ...args }) => {
  return (
    <ThemeProvider themeMode={ThemeMode.dark} themeName={ThemeName.website}>
      <HomeVideos data={videos} />
    </ThemeProvider>
  )
}

export const Default = Template.bind({})

export default HomeVideosStory as Meta
