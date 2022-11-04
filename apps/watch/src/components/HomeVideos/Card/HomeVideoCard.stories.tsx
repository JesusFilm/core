import { Story, Meta } from '@storybook/react'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName, ThemeMode } from '@core/shared/ui/themes'
import { watchConfig } from '../../../libs/storybook'
import { videos } from '../../../../pages'
import { data } from '../testData'
import { HomeVideoCard } from './HomeVideoCard'

const HomeVideoCardStory = {
  ...watchConfig,
  component: HomeVideoCard,
  title: 'Watch/HomeVideoCard'
}

const Template: Story = ({ ...args }) => {
  return (
    <ThemeProvider themeMode={ThemeMode.dark} themeName={ThemeName.website}>
      <HomeVideoCard video={args.video} designation={args.designation} />
    </ThemeProvider>
  )
}

export const Standalone = Template.bind({})
Standalone.args = {
  video: data[0],
  designation: videos[0].designation
}

export const Playlist = Template.bind({})
Playlist.args = {
  video: data[8],
  designation: videos[7].designation
}

export default HomeVideoCardStory as Meta
