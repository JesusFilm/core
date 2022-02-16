import { Story, Meta } from '@storybook/react'
import { journeyUiConfig, StoryCard, TreeBlock } from '../..'
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
} from '../../../__generated__/globalTypes'
import { GridContainerFields } from './__generated__/GridContainerFields'
import { GridContainer } from './GridContainer'

const Demo = {
  ...journeyUiConfig,
  component: GridContainer,
  title: 'Journeys-Ui/Grid/Container'
}

const DefaultTemplate: Story<TreeBlock<GridContainerFields>> = ({
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
    parentOrder: 0,
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
    parentBlockId: 'GridItemLeft',
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

const childrenTwo: TreeBlock[] = [
  {
    id: 'imageBlockId1',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1521904764098-e4e0a87e3ce0?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1365&q=80',
    width: 1600,
    height: 1067,
    alt: 'random image from unsplash',
    parentBlockId: 'GridItemRight',
    parentOrder: 0,
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
    children: []
  },
  {
    id: 'typographyBlockId2',
    __typename: 'TypographyBlock',
    parentBlockId: null,
    parentOrder: 1,
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
    parentOrder: 2,
    align: null,
    color: null,
    content: 'The only impossible journey is the one you never begin.',
    variant: TypographyVariant.h3,
    children: []
  }
]

export const Default: Story<TreeBlock<GridContainerFields>> =
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
      parentOrder: 0,
      children: childrenOne
    },
    {
      id: 'GridItemRight',
      __typename: 'GridItemBlock',
      xl: 6,
      lg: 6,
      sm: 6,
      parentBlockId: 'GridContainer',
      parentOrder: 1,
      children: childrenTwo
    }
  ]
}

export const OffsetRight: Story<TreeBlock<GridContainerFields>> =
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
      parentOrder: 0,
      children: childrenTwo
    }
  ]
}

export const Center: Story<TreeBlock<GridContainerFields>> =
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
      parentOrder: 0,
      children: childrenOne
    },
    {
      id: 'GridItemRight',
      xl: 6,
      lg: 6,
      sm: 6,
      __typename: 'GridItemBlock',
      parentBlockId: 'GridContainer',
      parentOrder: 1,
      children: [
        {
          id: 'typographyBlockId77',
          __typename: 'TypographyBlock',
          parentBlockId: null,
          parentOrder: 0,
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
