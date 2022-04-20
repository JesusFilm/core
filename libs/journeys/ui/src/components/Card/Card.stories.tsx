import { Story, Meta } from '@storybook/react'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { MockedProvider } from '@apollo/client/testing'
import { journeyUiConfig, TreeBlock } from '../..'
import {
  TypographyColor,
  TypographyVariant,
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  IconName,
  IconSize
} from '../../../__generated__/globalTypes'
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

const children: TreeBlock[] = [
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

export const Default: Story<TreeBlock<CardFields>> = Template.bind({})
Default.args = {
  themeMode: null,
  themeName: null,
  children
}

export const CustomColor: Story<TreeBlock<CardFields>> = Template.bind({})
CustomColor.args = {
  backgroundColor: '#F1A025',
  children
}

export const ImageCover: Story<TreeBlock<CardFields>> = Template.bind({})
ImageCover.args = {
  coverBlockId: 'imageBlockId1',
  children: [
    {
      id: 'typographyBlockId1',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      parentOrder: 0,
      align: null,
      color: TypographyColor.secondary,
      content: 'It s Ok To Get Angry',
      variant: TypographyVariant.overline,
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
        'Christianity isn’t about looking nice and religious; it’s diving into the deep end, a life fully immersed in following after Jesus.',
      variant: TypographyVariant.subtitle1,
      children: []
    },
    {
      id: 'typographyBlockId3',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      parentOrder: 2,
      align: null,
      color: null,
      content: 'Bible, 1 Corinthians 15:3-4',
      variant: TypographyVariant.body2,
      children: []
    },
    {
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
  ]
}

export const VideoCover: Story<TreeBlock<CardFields>> = Template.bind({})
VideoCover.args = {
  coverBlockId: 'videoBlockId1',
  children: [
    {
      id: 'typographyBlockId1',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      parentOrder: 0,
      align: null,
      color: TypographyColor.secondary,
      content: 'It s Ok To Get Angry',
      variant: TypographyVariant.overline,
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
        'Christianity isn’t about looking nice and religious; it’s diving into the deep end, a life fully immersed in following after Jesus.',
      variant: TypographyVariant.subtitle1,
      children: []
    },
    {
      id: 'typographyBlockId3',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      parentOrder: 2,
      align: null,
      color: null,
      content: 'Bible, 1 Corinthians 15:3-4',
      variant: TypographyVariant.body2,
      children: []
    },
    {
      __typename: 'VideoBlock',
      id: 'videoBlockId1',
      parentBlockId: null,
      parentOrder: 3,
      muted: true,
      autoplay: true,
      startAt: null,
      endAt: null,
      posterBlockId: 'posterBlockId',
      videoId: '2_0-FallingPlates',
      videoVariantLanguageId: '529',
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
      fullsize: null,
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
  ]
}

export const VideoContent: Story<TreeBlock<CardFields>> = Template.bind({})
VideoContent.args = {
  coverBlockId: 'videoBlockId1',
  children: [
    {
      __typename: 'VideoBlock',
      id: 'video1.id',
      parentBlockId: null,
      parentOrder: 0,
      autoplay: false,
      muted: true,
      videoId: '2_0-FallingPlates',
      videoVariantLanguageId: '529',
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
      startAt: null,
      endAt: null,
      posterBlockId: null,
      fullsize: true,
      children: []
    }
  ]
}

export const ImageBlur: Story<TreeBlock<CardFields>> = Template.bind({})
ImageBlur.args = {
  coverBlockId: 'imageBlockId1',
  children: [
    {
      id: 'typographyBlockId1',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      parentOrder: 0,
      align: null,
      color: null,
      content: 'Bible Quote',
      variant: TypographyVariant.overline,
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
        'For what I received I passed on to you as of first importance: that Christ died for our sins according to the Scriptures, that he was buried, that he was raised on the third day...',
      variant: TypographyVariant.subtitle1,
      children: []
    },
    {
      id: 'typographyBlockId3',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      parentOrder: 2,
      align: null,
      color: null,
      content: 'Bible, 1 Corinthians 15:3-4',
      variant: TypographyVariant.body2,
      children: []
    },
    {
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
  ],
  fullscreen: true
}

export default Demo as Meta
