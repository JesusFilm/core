import { Meta, StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveContent,
  ActiveSlide,
  EditorProvider,
  EditorState
} from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourney'

import { SinglePageEditor } from './SinglePageEditor'

const SinglePageEditorStory: Meta<typeof SinglePageEditor> = {
  ...simpleComponentConfig,
  component: SinglePageEditor,
  title: 'Journeys-Admin/Editor/SinglePageEditor',
  parameters: {
    layout: 'fullscreen'
  }
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
          action: {
            __typename: 'NavigateToBlockAction',
            parentBlockId: 'button1.id',
            gtmEventName: null,
            blockId: 'step2.id'
          },
          submitEnabled: true,
          children: []
        }
      ]
    }
  ]
}

const Template: StoryObj<
  ComponentProps<typeof SinglePageEditor> & { state: EditorState }
> = {
  render: ({ state, ...props }) => {
    return (
      <EditorProvider initialState={state}>
        <SinglePageEditor {...props} />
      </EditorProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    flowType: 'desktop',
    state: {
      activeSlide: ActiveSlide.JourneyFlow,
      activeContent: ActiveContent.Canvas,
      steps: [step1]
    }
  }
}

export const Settings = {
  ...Template,
  args: {
    flowType: 'desktop',
    state: {
      activeSlide: ActiveSlide.Content,
      activeContent: ActiveContent.Canvas,
      steps: [step1]
    }
  }
}

export default SinglePageEditorStory
