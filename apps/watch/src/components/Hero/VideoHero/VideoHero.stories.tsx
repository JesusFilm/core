import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'
import { VideoType } from '../../../../__generated__/globalTypes'
import { watchConfig } from '../../../libs/storybook'
import { VideoHero } from './VideoHero'

const VideoHeroStory = {
  ...watchConfig,
  component: VideoHero,
  title: 'Watch/Hero/VideoHero'
}

const Template: Story<ComponentProps<typeof VideoHero>> = ({ ...args }) => (
  <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.dark}>
    <VideoHero {...args} />
  </ThemeProvider>
)

export const Default = Template.bind({})
Default.args = {
  loading: false,
  video: {
    id: '1_cl-0-0',
    type: VideoType.standalone,
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_cl-0-0.mobileCinematicHigh.jpg',
    snippet: [
      {
        value:
          "In the first century, a group of children meet together to talk about what they've seen and heard about Jesus. Some believe Jesus is the Son of God. But others think Jesus may just be tricking the people.",
        __typename: 'Translation'
      }
    ],
    title: [
      {
        value: 'The Story of Jesus for Children',
        __typename: 'Translation'
      }
    ],
    variant: {
      duration: 3680,
      __typename: 'VideoVariant',
      hls: 'https://arc.gt/4jz75'
    },
    __typename: 'Video',
    episodeIds: [],
    slug: [
      {
        value: 'the-story-of-jesus-for-children',
        __typename: 'Translation'
      }
    ],
    children: []
  }
}

export default VideoHeroStory as Meta
