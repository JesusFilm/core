import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentPropsWithRef } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../../__generated__/BlockFields'
import { TypographyVariant } from '../../../../../../../../__generated__/globalTypes'

import { StepBlockNodeCard } from '.'

const StepBlockNodeCardDemo: Meta<typeof StepBlockNodeCard> = {
  ...simpleComponentConfig,
  component: StepBlockNodeCard,
  title:
    'Journeys-Admin/Editor/Slider/JourneyFlow/nodes/StepBlockNode/StepBlockNodeCard'
}

const Template: StoryObj<ComponentPropsWithRef<typeof StepBlockNodeCard>> = {
  render: ({ ...args }) => <StepBlockNodeCard {...args} />
}

const defaultStep: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'step.id',
  parentBlockId: null,
  parentOrder: 0,
  locked: false,
  nextBlockId: null,
  slug: null,
  children: []
}

export const Default = {
  ...Template,
  args: {
    selected: false,
    step: defaultStep
  }
}

export const Filled = {
  ...Template,
  args: {
    selected: true,
    step: {
      ...defaultStep,
      children: [
        {
          __typename: 'CardBlock',
          id: 'card.id',
          parentBlockId: 'step.id',
          parentOrder: 0,
          backgroundColor: null,
          coverBlockId: 'coverImageBlock.id',
          themeName: null,
          themeMode: null,
          fullscreen: false,
          backdropBlur: null,
          children: [
            {
              __typename: 'ImageBlock',
              id: 'coverImageBlock.id',
              parentBlockId: 'card.id',
              parentOrder: null,
              src: 'https://tinyurl.com/7hbuynkw',
              alt: 'image from unsplash',
              width: 150,
              height: 300,
              blurHash: '',
              children: []
            },
            {
              __typename: 'TypographyBlock',
              id: 'typog1.id',
              parentBlockId: 'card.id',
              parentOrder: 0,
              align: null,
              color: null,
              content: 'Title',
              variant: TypographyVariant.h1,
              children: [],
              settings: {
                __typename: 'TypographyBlockSettings',
                color: null
              }
            },
            {
              __typename: 'TypographyBlock',
              id: 'typog2.id',
              parentBlockId: 'card.id',
              parentOrder: 1,
              align: null,
              color: null,
              content: 'Subtitle',
              variant: null,
              children: [],
              settings: {
                __typename: 'TypographyBlockSettings',
                color: null
              }
            }
          ]
        }
      ]
    }
  }
}

export default StepBlockNodeCardDemo
