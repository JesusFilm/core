import { Story, Meta } from '@storybook/react'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { MockedProvider } from '@apollo/client/testing'
import { journeyUiConfig } from '../../libs/journeyUiConfig'
import type { TreeBlock } from '../../libs/block'
import {
  TypographyVariant,
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  IconName,
  IconSize,
  VideoBlockSource
} from '../../../__generated__/globalTypes'
import { ImageFields } from '../Image/__generated__/ImageFields'
import { VideoFields } from '../Video/__generated__/VideoFields'
import { CardFields } from './__generated__/CardFields'
import { Card } from './Card'

const Demo = {
  ...journeyUiConfig,
  component: Card,
  title: 'Journeys-Ui/Card'
}

const Template: Story<TreeBlock<CardFields>> = ({ ...props }) => {
  const theme = useTheme()
  return (
    <MockedProvider>
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
        <Card {...props} />
      </Box>
    </MockedProvider>
  )
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
  blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
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
  },
  action: null,
  fullsize: null,
  children: []
}

// Expanded - default content background
export const Default: Story<TreeBlock<CardFields>> = Template.bind({})
Default.args = {
  themeMode: null,
  themeName: null,
  children: content
}

// Expanded - override content background
export const Custom: Story<TreeBlock<CardFields>> = Template.bind({})
Custom.args = {
  backgroundColor: '#F1A025',
  children: content
}

// Expanded - blur image content background
export const ImageBlur: Story<TreeBlock<CardFields>> = Template.bind({})
ImageBlur.args = {
  coverBlockId: image.id,
  children: [...content, image],
  fullscreen: true
}

// Contained - cover image background with blur image content background
export const ImageCover: Story<TreeBlock<CardFields>> = Template.bind({})
ImageCover.args = {
  coverBlockId: image.id,
  children: [...content, image]
}

// Contained - cover video background with default content background
export const VideoCoverDefault: Story<TreeBlock<CardFields>> = Template.bind({})
VideoCoverDefault.args = {
  coverBlockId: video.id,
  children: [...content, video]
}

// Contained - cover video background with override content background
export const VideoCoverCustom: Story<TreeBlock<CardFields>> = Template.bind({})
VideoCoverCustom.args = {
  backgroundColor: '#F1A025',
  coverBlockId: video.id,
  children: [...content, video]
}

// Contained - cover video background with blur poster image content background
export const VideoCoverPoster: Story<TreeBlock<CardFields>> = Template.bind({})
VideoCoverPoster.args = {
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

// Contained - youtube
export const VideoYoutubeDefault: Story<TreeBlock<CardFields>> = Template.bind(
  {}
)
VideoYoutubeDefault.args = {
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

// Expanded - child video block displays fullscreen simulating video only card
export const VideoContent: Story<TreeBlock<CardFields>> = Template.bind({})
VideoContent.args = {
  children: [{ ...video, autoplay: false, parentOrder: 0 }]
}

export default Demo as Meta
