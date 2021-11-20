import { Story, Meta } from '@storybook/react'
import { GetJourney_journey_blocks_GridContainerBlock as GridContainerBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { GridContainer } from './GridContainer'
import { journeysConfig, StoryCard } from '../../../libs/storybook'
import {
  TypographyVariant,
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  IconName,
  IconSize,
  GridAlignItems,
  GridDirection,
  GridJustifyContent
} from '../../../../__generated__/globalTypes'

const Demo = {
  ...journeysConfig,
  component: GridContainer,
  title: 'Journeys/Blocks/Grid/Container'
}

const DefaultTemplate: Story<TreeBlock<GridContainerBlock>> = ({
  ...props
}) => (
  <StoryCard>
    <GridContainer {...props} />
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
      name: IconName.PlayArrowRounded,
      color: null,
      size: IconSize.lg
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
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
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

export const Default: Story<TreeBlock<GridContainerBlock>> =
  DefaultTemplate.bind({})
Default.args = {
  id: 'GridContainer',
  __typename: 'GridContainerBlock',
  spacing: 6,
  direction: GridDirection.row,
  justifyContent: GridJustifyContent.flexEnd,
  alignItems: GridAlignItems.flexEnd,
  children: [
    {
      id: 'GridItemLeft',
      __typename: 'GridItemBlock',
      xl: 6,
      lg: 6,
      sm: 6,
      parentBlockId: 'GridContainer',
      children: childrenOne
    },
    {
      id: 'GridItemRight',
      __typename: 'GridItemBlock',
      xl: 6,
      lg: 6,
      sm: 6,
      parentBlockId: 'GridContainer',
      children: childrenTwo
    }
  ]
}

export const OffsetRight: Story<TreeBlock<GridContainerBlock>> =
  DefaultTemplate.bind({})
OffsetRight.args = {
  id: 'GridContainer',
  __typename: 'GridContainerBlock',
  spacing: 6,
  direction: GridDirection.row,
  justifyContent: GridJustifyContent.flexEnd,
  alignItems: GridAlignItems.baseline,
  children: [
    {
      id: 'GridItemRight',
      xl: 6,
      lg: 6,
      sm: 6,
      __typename: 'GridItemBlock',
      parentBlockId: 'GridContainer',
      children: childrenTwo
    }
  ]
}

export const Center: Story<TreeBlock<GridContainerBlock>> =
  DefaultTemplate.bind({})
Center.args = {
  id: 'GridContainer',
  __typename: 'GridContainerBlock',
  spacing: 6,
  direction: GridDirection.row,
  justifyContent: GridJustifyContent.center,
  alignItems: GridAlignItems.center,
  children: [
    {
      id: 'GridItemLeft',
      xl: 6,
      lg: 6,
      sm: 6,
      __typename: 'GridItemBlock',
      parentBlockId: 'GridContainer',
      children: childrenOne
    },
    {
      id: 'GridItemRight',
      xl: 6,
      lg: 6,
      sm: 6,
      __typename: 'GridItemBlock',
      parentBlockId: 'GridContainer',
      children: [
        {
          id: 'typographyBlockId77',
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
  ]
}
export default Demo as Meta
