import { Story, Meta } from '@storybook/react'
import { Card } from './Card'
import { journeysConfig } from '../../../libs/storybook'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import {
  ThemeMode,
  ThemeName,
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

export const CoverBlockId: Story<TreeBlock<CardBlock>> = Template.bind({})
CoverBlockId.args = {
  coverBlockId: 'imageBlockId1',
  children: [
    ...children,
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
