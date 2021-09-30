import { Story, Meta } from '@storybook/react'
import { Card } from './Card'
import { journeysConfig } from '../../../libs/storybook/decorators'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import {
  ThemeMode,
  ThemeName,
  TypographyVariant
} from '../../../../__generated__/globalTypes'

const Demo = {
  ...journeysConfig,
  component: Card,
  title: 'Journeys/Blocks/Card'
}

const DefaultTemplate: Story<TreeBlock<CardBlock>> = ({ ...props }) => (
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
  }
]

export const Default: Story<TreeBlock<CardBlock>> = DefaultTemplate.bind({})
Default.args = {
  children
}

export const Light: Story<TreeBlock<CardBlock>> = DefaultTemplate.bind({})
Light.args = {
  themeMode: ThemeMode.light,
  themeName: ThemeName.base,
  children
}

export const Dark: Story<TreeBlock<CardBlock>> = DefaultTemplate.bind({})
Dark.args = {
  themeMode: ThemeMode.dark,
  themeName: ThemeName.base,
  children
}

export const CustomColor: Story<TreeBlock<CardBlock>> = DefaultTemplate.bind({})
CustomColor.args = {
  themeMode: ThemeMode.dark,
  themeName: ThemeName.base,
  backgroundColor: '#F1A025',
  children
}

export const CoverBlockId: Story<TreeBlock<CardBlock>> = DefaultTemplate.bind(
  {}
)
CoverBlockId.args = {
  coverBlockId: 'imageBlockId1',
  children: [
    ...children,
    {
      id: 'imageBlockId1',
      __typename: 'ImageBlock',
      src: 'https://images.unsplash.com/photo-1631749665601-99bde3aae4d3?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=1080&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTYzMjk4Mzg0Nw&ixlib=rb-1.2.1&q=80&w=1920',
      width: 1600,
      height: 1067,
      alt: 'random image from unsplash',
      parentBlockId: 'Image1',
      children: []
    }
  ]
}

export default Demo as Meta
