import { Story, Meta } from '@storybook/react'
import { GetJourney_journey_blocks_GridItemBlock as GridItemBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { journeysConfig, StoryCard } from '../../../libs/storybook'
import {
  TypographyVariant,
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  IconName,
  IconSize
} from '../../../../__generated__/globalTypes'
import { GridItem } from './GridItem'

const Demo = {
  ...journeysConfig,
  component: GridItem,
  title: 'Journeys/Blocks/Grid/Item'
}

const DefaultTemplate: Story<TreeBlock<GridItemBlock>> = ({ ...props }) => (
  <StoryCard>
    <GridItem {...props} />
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

const Default: Story<TreeBlock<GridItemBlock>> = DefaultTemplate.bind({})
Default.args = {
  id: 'GridItemLeft',
  __typename: 'GridItemBlock',
  xl: 6,
  lg: 6,
  sm: 6,
  parentBlockId: 'GridContainer',
  children: childrenOne
}

export default Demo as Meta
export { Default }
