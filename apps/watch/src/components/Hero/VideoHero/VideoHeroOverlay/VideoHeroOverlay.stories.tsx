import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'
import Box from '@mui/system/Box'
import { VideoType } from '../../../../../__generated__/globalTypes'
import { watchConfig } from '../../../../libs/storybook'
import { VideoHeroOverlay } from './VideoHeroOverlay'

const VideoHeroOverlayStory = {
  ...watchConfig,
  component: VideoHeroOverlay,
  title: 'Watch/Hero/VideoHero/VideoHeroOverlay',
  parameters: {
    fullscreen: true
  }
}

const Template: Story<ComponentProps<typeof VideoHeroOverlay>> = ({
  ...args
}) => (
  <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.dark}>
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: 776
      }}
    >
      <VideoHeroOverlay {...args} />
    </Box>
  </ThemeProvider>
)

export const Default = Template.bind({})
Default.args = {
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
    ]
  }
}

export default VideoHeroOverlayStory as Meta
