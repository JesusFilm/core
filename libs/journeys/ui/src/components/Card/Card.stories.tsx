import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { Meta, StoryObj } from '@storybook/react'
import { SnackbarProvider } from 'notistack'
import { ComponentProps } from 'react'

import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  IconName,
  IconSize,
  TypographyVariant,
  VideoBlockSource
} from '../../../__generated__/globalTypes'
import type { TreeBlock } from '../../libs/block'
import { journeyUiConfig } from '../../libs/journeyUiConfig'
import { ImageFields } from '../Image/__generated__/ImageFields'
import { VideoFields } from '../Video/__generated__/VideoFields'

import { Card } from './Card'

const Demo: Meta<typeof Card> = {
  ...journeyUiConfig,
  component: Card,
  title: 'Journeys-Ui/Card',
  parameters: {
    docs: {
      source: { type: 'code' }
    },

    chromatic: { delay: 3000 }
  }
}

const content: TreeBlock[] = [
  {
    id: 'typographyBlockId1',
    __typename: 'TypographyBlock',
    parentBlockId: null,
    parentOrder: 0,
    align: null,
    color: null,
    content: "What's our purpose, and how did we get here?",
    variant: TypographyVariant.h3,
    children: []
  ,
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  }
},
  {
    id: 'typographyBlockId2',
    __typename: 'TypographyBlock',
    parentBlockId: null,
    parentOrder: 1,
    align: null,
    color: null,
    content:
      'Follow the journey of a curious Irishman traveling around the world looking for answers and wrestling with the things that just don’t seem to make sense. ',
    variant: null,
    children: []
  ,
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  }
},
  {
    __typename: 'ButtonBlock',
    id: 'button',
    parentBlockId: 'question',
    parentOrder: 2,
    label: 'Watch Now',
    buttonVariant: ButtonVariant.contained,
    buttonColor: ButtonColor.primary,
    size: ButtonSize.large,
    startIconId: 'icon',
    endIconId: null,
    submitEnabled: null,
    action: null,
    children: [
      {
        id: 'icon',
        __typename: 'IconBlock',
        parentBlockId: 'button',
        parentOrder: 0,
        iconName: IconName.PlayArrowRounded,
        iconColor: null,
        iconSize: IconSize.md,
        children: []
      }
    ]
  }
]

const image: TreeBlock<ImageFields> = {
  id: 'imageBlockId1',
  __typename: 'ImageBlock',
  src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
  width: 1920,
  height: 1080,
  alt: 'random image from unsplash',
  parentBlockId: 'Image1',
  parentOrder: 3,
  children: [],
  blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
  scale: null,
  focalLeft: 50,
  focalTop: 50
}

const video: TreeBlock<VideoFields> = {
  __typename: 'VideoBlock',
  id: 'videoBlockId1',
  parentBlockId: null,
  parentOrder: null,
  muted: true,
  autoplay: true,
  startAt: null,
  endAt: null,
  posterBlockId: null,
  videoId: '2_0-FallingPlates',
  videoVariantLanguageId: '529',
  source: VideoBlockSource.internal,
  title: null,
  description: null,
  duration: null,
  image: null,
  objectFit: null,
  mediaVideo: {
    __typename: 'Video',
    id: '2_0-FallingPlates',
    title: [
      {
        __typename: 'VideoTitle',
        value: 'FallingPlates'
      }
    ],
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    variant: {
      __typename: 'VideoVariant',
      id: '2_0-FallingPlates-529',
      hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
    },
    variantLanguages: []
  },
  action: null,
  fullsize: null,
  children: []
}

type Story = StoryObj<ComponentProps<typeof Card>>

const Template: Story = {
  render: ({ ...args }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const theme = useTheme()
    return (
      <MockedProvider>
        <SnackbarProvider>
          <Box
            sx={{
              height: 'calc(100vh - 80px)',
              maxHeight: 'calc(100vh - 80px)',
              [theme.breakpoints.up('sm')]: {
                maxHeight: '460px'
              },
              [theme.breakpoints.up('lg')]: {
                maxWidth: '854px',
                maxHeight: '480px'
              }
            }}
          >
            <Card {...args} />
          </Box>
        </SnackbarProvider>
      </MockedProvider>
    )
  }
}

// Expanded - default content background
export const Default = {
  ...Template,
  args: {
    themeMode: null,
    themeName: null,
    children: content
  }
}

// Expanded - override content background
export const Custom = {
  ...Template,
  args: {
    ...Default.args,
    backgroundColor: '#F1A025'
  }
}

// Expanded - blur image content background
export const ImageBlur = {
  ...Template,
  args: {
    ...Default.args,
    coverBlockId: image.id,
    children: [...content, image],
    fullscreen: true,
    backdropBlur: null
  }
}

// RTL Expanded - blur image content background
export const RTLImageBlur = {
  ...Template,
  args: { ...ImageBlur.args },
  parameters: { rtl: true }
}

// Contained - cover image background with blur image content background
export const ImageCover = {
  ...Template,
  args: {
    ...Default.args,
    coverBlockId: image.id,
    children: [...content, image]
  },
  parameters: {
    chromatic: { viewports: [360, 599, 1200] }
  }
}

// RTL Expanded - blur image content background
export const RTLImageCover = {
  ...Template,
  args: { ...ImageCover.args },
  parameters: {
    rtl: true,
    chromatic: { viewports: [360, 599, 1200] }
  }
}

// Contained - cover video background with default content background
export const VideoCoverDefault = {
  ...Template,
  args: {
    ...Default.args,
    coverBlockId: video.id,
    children: [...content, video]
  }
}

// Contained - cover video background with override content background
export const VideoCoverCustom = {
  ...Template,
  args: {
    ...Default.args,
    backgroundColor: '#F1A025',
    coverBlockId: video.id,
    children: [...content, video]
  }
}

// Contained - cover video background with blur poster image content background
export const VideoCoverPoster = {
  ...Template,
  args: {
    ...Default.args,
    coverBlockId: video.id,
    children: [
      ...content,
      {
        ...video,
        posterBlockId: image.id,
        children: [image]
      }
    ]
  }
}

// Contained - youtube
export const VideoYoutubeDefault = {
  ...Template,
  args: {
    ...Default.args,
    coverBlockId: video.id,
    children: [
      ...content,
      {
        ...video,
        video: null,
        videoId: '5I69DCxYbBg',
        source: VideoBlockSource.youTube,
        startAt: 2738
      }
    ]
  }
}

// Child video block displays fullscreen simulating video only card
export const ExpandedWithVideo = {
  ...Template,
  args: {
    ...Default.args,
    children: [...content, { ...video, autoplay: false, parentOrder: 0 }]
  }
}

// Child video block displays fullscreen simulating video only card
export const ContainedWithVideo = {
  ...Template,
  args: {
    ...Default.args,
    coverBlockId: 'backgroundVideo',
    children: [
      ...content,
      { ...video, autoplay: false, parentOrder: 0 },
      {
        ...video,
        id: 'backgroundVideo',
        video: null,
        videoId: '5I69DCxYbBg',
        source: VideoBlockSource.youTube,
        startAt: 2738
      }
    ]
  }
}

export default Demo
