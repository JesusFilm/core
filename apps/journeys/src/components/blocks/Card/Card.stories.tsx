import { Story, Meta } from '@storybook/react'
import { Card } from './Card'
import { journeysConfig } from '../../../libs/storybook'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import {
  ThemeMode,
  ThemeName,
  TypographyColor,
  TypographyVariant,
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  IconName,
  IconSize
} from '../../../../__generated__/globalTypes'
import { useTheme, Box } from '@mui/material'

const Demo: Meta = {
  ...journeysConfig,
  component: Card,
  title: 'Journeys/Blocks/Card',
  parameters: {
    theme: 'light',
    chromatic: {
      viewports: [
        360, // Mobile (P)
        568, // Mobile (L)
        600, // Tablet (P)
        961, // Tablet (L)
        1200 // Laptop/Desktop
      ]
    }
  }
}

const Template: Story<TreeBlock<CardBlock>> = ({ ...props }) => {
  const theme = useTheme()
  return (
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
  )
}

const children: TreeBlock[] = [
  {
    id: 'typographyBlockId1',
    __typename: 'TypographyBlock',
    parentBlockId: null,
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
    label: 'Watch Now',
    buttonVariant: ButtonVariant.contained,
    buttonColor: ButtonColor.primary,
    size: ButtonSize.large,
    startIcon: {
      __typename: 'Icon',
      name: IconName.PlayArrow,
      color: null,
      size: IconSize.md
    },
    endIcon: null,
    action: null,
    children: []
  }
]

export const Default: Story<TreeBlock<CardBlock>> = Template.bind({})
Default.args = {
  themeMode: ThemeMode.light,
  themeName: ThemeName.base,
  children
}

export const Dark: Story<TreeBlock<CardBlock>> = Template.bind({})
Dark.args = {
  ...Default.args,
  themeMode: ThemeMode.dark
}

export const CustomColor: Story<TreeBlock<CardBlock>> = Template.bind({})
CustomColor.args = {
  backgroundColor: '#F1A025',
  children
}

export const CustomColorDark: Story<TreeBlock<CardBlock>> = Template.bind({})
CustomColorDark.args = {
  ...CustomColor.args
}
CustomColorDark.parameters = {
  theme: 'dark'
}

export const ImageCover: Story<TreeBlock<CardBlock>> = Template.bind({})
ImageCover.args = {
  coverBlockId: 'imageBlockId1',
  children: [
    {
      id: 'typographyBlockId1',
      __typename: 'TypographyBlock',
      parentBlockId: null,
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
      children: [],
      blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
    }
  ]
}

export const ImageCoverDark: Story<TreeBlock<CardBlock>> = Template.bind({})
ImageCoverDark.args = {
  ...ImageCover.args
}
ImageCoverDark.parameters = {
  theme: 'dark'
}

export const VideoCover: Story<TreeBlock<CardBlock>> = Template.bind({})
VideoCover.args = {
  coverBlockId: 'videoBlockId1',
  children: [
    {
      id: 'typographyBlockId1',
      __typename: 'TypographyBlock',
      parentBlockId: null,
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
      align: null,
      color: null,
      content: 'Bible, 1 Corinthians 15:3-4',
      variant: TypographyVariant.body2,
      children: []
    },
    {
      __typename: 'VideoBlock',
      id: 'videoBlockId1',
      parentBlockId: '',
      volume: 1,
      autoplay: true,
      title: 'video',
      src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
      children: []
    }
  ]
}

export const ImageBlur: Story<TreeBlock<CardBlock>> = Template.bind({})
ImageBlur.args = {
  coverBlockId: 'imageBlockId1',
  children: [
    {
      id: 'typographyBlockId1',
      __typename: 'TypographyBlock',
      parentBlockId: null,
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
      children: [],
      blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
    }
  ],
  fullscreen: true
}

export const ImageBlurDark: Story<TreeBlock<CardBlock>> = Template.bind({})
ImageBlurDark.args = {
  ...ImageBlur.args
}
ImageBlurDark.parameters = {
  theme: 'dark'
}

export default Demo
