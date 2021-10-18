import { Story, Meta } from '@storybook/react'
import { GetJourney_journey_blocks_GridBlock as GridBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { Grid } from './Grid'
import { journeysConfig, StoryCard } from '../../../libs/storybook'
import {
  TypographyVariant,
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  IconName,
  IconSize,
  GridType,
  ColumnSize
} from '../../../../__generated__/globalTypes'

const Demo = {
  ...journeysConfig,
  component: Grid,
  title: 'Journeys/Blocks/Grid'
}

const DefaultTemplate: Story<TreeBlock<GridBlock>> = ({ ...props }) => (
  <StoryCard>
    <Grid {...props} />
  </StoryCard>
)

const childrenOne: TreeBlock[] = [
  {
    id: 'typographyBlockId',
    __typename: 'TypographyBlock',
    parentBlockId: 'GridItemLeft',
    align: null,
    color: null,
    content: "What's the purpose, and how did we get here?",
    variant: TypographyVariant.h3,
    children: []
  },
  {
    id: 'typographyBlockId1',
    __typename: 'TypographyBlock',
    parentBlockId: 'GridItemLeft',
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
    parentBlockId: 'GridItemLeft',
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

const childrenTwo: TreeBlock[] = [
  {
    id: 'imageBlockId1',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1521904764098-e4e0a87e3ce0?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1365&q=80',
    width: 1600,
    height: 1067,
    alt: 'random image from unsplash',
    parentBlockId: 'GridItemRight',
    children: []
  },
  {
    id: 'typographyBlockId2',
    __typename: 'TypographyBlock',
    parentBlockId: null,
    align: null,
    color: null,
    content: 'Regular Image Example',
    variant: TypographyVariant.overline,
    children: []
  },
  {
    id: 'typographyBlockId3',
    __typename: 'TypographyBlock',
    parentBlockId: null,
    align: null,
    color: null,
    content: 'The only impossible journey is the one you never begin.',
    variant: TypographyVariant.h3,
    children: []
  }
]

export const Default: Story<TreeBlock<GridBlock>> = DefaultTemplate.bind({})
Default.args = {
  id: 'GridContainer',
  type: GridType.container,
  children: [
    {
      id: 'GridItemLeft',
      __typename: 'GridBlock',
      md: ColumnSize._8,
      type: GridType.item,
      parentBlockId: 'GridContainer',
      children: childrenOne
    },
    {
      id: 'GridItemRight',
      md: ColumnSize._4,
      __typename: 'GridBlock',
      type: GridType.item,
      parentBlockId: 'GridContainer',
      children: childrenTwo
    }
  ]
}

export default Demo as Meta
