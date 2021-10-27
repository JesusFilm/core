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

const Demo = {
  ...journeysConfig,
  component: Card,
  title: 'Journeys/Blocks/Card'
}

const Template: Story<TreeBlock<CardBlock>> = ({ ...props }) => (
  <Card {...props} />
)

const children: TreeBlock[] = [
  {
    id: 'typographyBlockId1',
    __typename: 'TypographyBlock',
    parentBlockId: null,
    align: null,
    color: null,
    content: "What's the purpose, and how did we get here?",
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

export const Light: Story<TreeBlock<CardBlock>> = Template.bind({})
Light.args = {
  themeMode: ThemeMode.light,
  themeName: ThemeName.base,
  children
}

export const Dark: Story<TreeBlock<CardBlock>> = Template.bind({})
Dark.args = {
  themeMode: ThemeMode.dark,
  themeName: ThemeName.base,
  children
}

export const CustomColor: Story<TreeBlock<CardBlock>> = Template.bind({})
CustomColor.args = {
  themeMode: ThemeMode.dark,
  themeName: ThemeName.base,
  backgroundColor: '#F1A025',
  children
}

export const WithCover1: Story<TreeBlock<CardBlock>> = Template.bind({})
WithCover1.args = {
  coverBlockId: 'imageBlockId1',
  children: [
    {
      id: 'typographyBlockId1',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      align: null,
      color: TypographyColor.secondary,
      content: 'Free Video Course',
      variant: TypographyVariant.overline,
      children: []
    },
    {
      id: 'typographyBlockId2',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      align: null,
      color: null,
      content: 'Why Do I Like Jesus, But Struggle With Christians?',
      variant: TypographyVariant.h4,
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
    },
    {
      id: 'imageBlockId1',
      __typename: 'ImageBlock',
      src: 'https://imgur.com/pfNv5Ob.jpg',
      width: 840,
      height: 439,
      alt: 'random image from unsplash',
      parentBlockId: 'Image1',
      children: [],
      blurhash: 'L26a*Sml0KPB_2%2NH57-:ayRjxZ'
    }
  ]
}

export const WithCover2: Story<TreeBlock<CardBlock>> = Template.bind({})
WithCover2.args = {
  coverBlockId: 'imageBlockId1',
  children: [
    {
      id: 'typographyBlockId1',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      align: null,
      color: TypographyColor.secondary,
      content: 'Jesus Christ:',
      variant: TypographyVariant.overline,
      children: []
    },
    {
      id: 'typographyBlockId2',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      align: null,
      color: null,
      content: 'Fact or Fiction?',
      variant: TypographyVariant.h2,
      children: []
    },
    {
      id: 'typographyBlockId3',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      align: null,
      color: null,
      content:
        'Consider the arguments for and against the idea that the disciples of Jesus fabricated the story.',
      variant: TypographyVariant.body2,
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
    },
    {
      id: 'imageBlockId1',
      __typename: 'ImageBlock',
      src: 'https://i.imgur.com/auH44Se.jpg',
      width: 840,
      height: 439,
      alt: 'random image from unsplash',
      parentBlockId: 'Image1',
      children: [],
      blurhash: 'LSGR*ftnngt7~pogM{Rk^*R,V@Rk'
    }
  ]
}

export const WithCover3: Story<TreeBlock<CardBlock>> = Template.bind({})
WithCover3.args = {
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

export const WithFullscreenCover: Story<TreeBlock<CardBlock>> = Template.bind(
  {}
)
WithFullscreenCover.args = {
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

export const ImageAndText: Story<TreeBlock<CardBlock>> = Template.bind({})
ImageAndText.args = {
  themeMode: ThemeMode.dark,
  themeName: ThemeName.base,
  backgroundColor: '#3C4543',
  children: [
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
    },
    {
      id: 'typographyBlockId1',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      align: null,
      color: null,
      content: 'Regular Image Example',
      variant: TypographyVariant.overline,
      children: []
    },
    {
      id: 'typographyBlockId2',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      align: null,
      color: null,
      content: 'The only impossible journey is the one you never begin.',
      variant: TypographyVariant.h3,
      children: []
    }
  ]
}

export default Demo as Meta
