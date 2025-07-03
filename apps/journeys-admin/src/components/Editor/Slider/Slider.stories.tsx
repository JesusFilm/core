import { StoryObj } from '@storybook/react'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveSlide,
  EditorProvider,
  EditorState
} from '@core/journeys/ui/EditorProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourney'

import { Slider } from '.'

const SliderDemo = {
  ...journeysAdminConfig,
  component: Slider,
  title: 'Journeys-Admin/Editor/Slider'
}

const Template: StoryObj<{ state: EditorState }> = {
  render: ({ state }) => (
    <EditorProvider initialState={state}>
      <Slider />
    </EditorProvider>
  )
}

const step1: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'step1.id',
  parentBlockId: 'journeyId',
  parentOrder: 0,
  locked: false,
  nextBlockId: null,
  slug: null,
  children: [
    {
      __typename: 'CardBlock',
      id: 'card1.id',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      backgroundColor: null,
      coverBlockId: null,
      themeName: null,
      themeMode: null,
      fullscreen: false,
      backdropBlur: null,
      children: [
        {
          __typename: 'TypographyBlock',
          id: 'typography1.id',
          parentBlockId: 'card1.id',
          parentOrder: 0,
          align: null,
          color: null,
          content: 'Step 1',
          variant: null,
          children: []
        },
        {
          __typename: 'ButtonBlock',
          id: 'button1.id',
          parentBlockId: 'card1.id',
          parentOrder: 1,
          label: 'Next',
          buttonVariant: null,
          buttonColor: null,
          size: null,
          startIconId: null,
          endIconId: null,
          submitEnabled: null,
          action: {
            __typename: 'NavigateToBlockAction',
            parentBlockId: 'button1.id',
            gtmEventName: null,
            blockId: 'step2.id'
          },
          children: []
        }
      ]
    }
  ]
}

const step2: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'step2.id',
  parentBlockId: 'journeyId',
  parentOrder: 1,
  locked: false,
  nextBlockId: null,
  slug: null,
  children: [
    {
      __typename: 'CardBlock',
      id: 'card2.id',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      backgroundColor: null,
      coverBlockId: null,
      themeName: null,
      themeMode: null,
      fullscreen: false,
      backdropBlur: null,
      children: [
        {
          __typename: 'TypographyBlock',
          id: 'typography2.id',
          parentBlockId: 'card2.id',
          parentOrder: 0,
          align: null,
          color: null,
          content: 'Step 2',
          variant: null,
          children: []
        }
      ]
    }
  ]
}

export const Default = {
  ...Template,
  args: {
    state: {
      steps: [step1, step2],
      activeSlide: ActiveSlide.JourneyFlow
    }
  }
}

export const Content = {
  ...Template,
  args: {
    state: {
      steps: [step1, step2],
      activeSlide: ActiveSlide.Content
    }
  }
}

export const Settings = {
  ...Template,
  args: {
    state: {
      steps: [step1, step2],
      activeSlide: ActiveSlide.Drawer
    }
  }
}

export default SliderDemo
