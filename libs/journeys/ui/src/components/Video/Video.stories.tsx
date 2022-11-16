import { ComponentProps } from 'react'
import { Meta, Story } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { journeyUiConfig } from '../../libs/journeyUiConfig'
import { VIDEO_START_EVENT_CREATE } from '../VideoEvents/VideoEvents'
import { VideoBlockSource } from '../../../__generated__/globalTypes'
import { Video } from '.'

const Demo = {
  ...journeyUiConfig,
  component: Video,
  title: 'Journeys-Ui/Video'
}

const emptyVideo: Omit<ComponentProps<typeof Video>, 'source'> = {
  __typename: 'VideoBlock',
  id: 'video1.id',
  parentBlockId: 'step1.id',
  parentOrder: 0,
  autoplay: false,
  muted: false,
  videoId: null,
  videoVariantLanguageId: null,
  title: null,
  description: null,
  duration: null,
  image: null,
  video: null,
  startAt: null,
  endAt: null,
  posterBlockId: null,
  fullsize: null,
  action: null,
  children: []
}

const startVideoMock = {
  request: {
    query: VIDEO_START_EVENT_CREATE,
    variables: {
      id: 'uuid',
      blockId: 'video0.id',
      position: 30
    }
  },
  result: {
    data: {
      id: 'uuid'
    }
  }
}

const Template: Story<ComponentProps<typeof Video>> = ({ ...args }) => (
  <MockedProvider mocks={[startVideoMock]}>
    <Box
      sx={{
        position: 'relative',
        minHeight: 'inherit',
        height: '100%'
      }}
    >
      <Video {...args} />
    </Box>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = { ...emptyVideo }

export const Arclight = Template.bind({})
Arclight.args = {
  ...Default.args,
  videoId: '2_0-FallingPlates',
  videoVariantLanguageId: '529',
  source: VideoBlockSource.internal,
  video: {
    __typename: 'Video',
    id: '2_0-FallingPlates',
    title: [
      {
        __typename: 'Translation',
        value: 'FallingPlates'
      }
    ],
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-FallingPlates.mobileCinematicHigh.jpg',
    variant: {
      __typename: 'VideoVariant',
      id: '2_0-FallingPlates-529',
      hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
    }
  }
}

export const Youtube = Template.bind({})
Youtube.args = {
  ...Default.args,
  source: VideoBlockSource.youTube,
  videoId: 'F7k5pqBVinA'
}

export const Autoplay = Template.bind({})
Autoplay.args = {
  ...Arclight.args,
  autoplay: true
}
Autoplay.parameters = {
  chromatic: { disableSnapshot: true }
}

export const Muted = Template.bind({})
Muted.args = {
  ...Arclight.args,
  muted: true
}
Muted.parameters = {
  chromatic: { disableSnapshot: true }
}

export const StartAndEndAt = Template.bind({})
StartAndEndAt.args = {
  ...Arclight.args,
  startAt: 20,
  endAt: 60
}
StartAndEndAt.parameters = {
  chromatic: { disableSnapshot: true }
}

export const Poster = Template.bind({})
Poster.args = {
  ...Arclight.args,
  posterBlockId: 'posterBlockId',
  children: [
    {
      id: 'posterBlockId',
      __typename: 'ImageBlock',
      src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
      alt: 'random image from unsplash',
      width: 1600,
      height: 1067,
      blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
      parentBlockId: 'videoBlockId',
      parentOrder: 0,
      children: []
    }
  ]
}

export default Demo as Meta
