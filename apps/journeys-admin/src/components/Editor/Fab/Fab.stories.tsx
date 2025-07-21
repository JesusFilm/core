import { StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveSlide,
  EditorProvider,
  EditorState
} from '@core/journeys/ui/EditorProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { StepFields as StepBlock } from '../../../../__generated__/StepFields'

import { Fab } from '.'

const FabDemo = {
  ...journeysAdminConfig,
  component: Fab,
  title: 'Journeys-Admin/Editor/Fab'
}

const defaultStep: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'step1.id',
  parentBlockId: null,
  parentOrder: 0,
  locked: false,
  nextBlockId: null,
  children: [],
  slug: null
}

const Template: StoryObj<ComponentProps<typeof Fab> & { state: EditorState }> =
  {
    render: ({ ...args }) => (
      <EditorProvider initialState={args.state}>
        <Fab {...args} />
      </EditorProvider>
    )
  }

export const AddDesktop = {
  ...Template,
  args: {
    variant: 'canvas',
    state: {
      activeSlide: ActiveSlide.Content,
      activeContent: ActiveContent.Canvas,
      activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.AddBlock,
      selectedStep: defaultStep,
      steps: [defaultStep]
    }
  }
}

export const AddMobile = {
  ...Template,
  args: {
    variant: 'mobile',
    state: {
      activeSlide: ActiveSlide.Content,
      activeContent: ActiveContent.Canvas,
      activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.AddBlock,
      selectedStep: defaultStep,
      steps: [defaultStep]
    }
  }
}

export const DisabledDesktop = {
  ...Template,
  args: {
    variant: 'canvas',
    state: {
      activeSlide: ActiveSlide.Content,
      activeContent: ActiveContent.Canvas,
      activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.AddBlock,
      selectedStep: null,
      steps: null
    }
  }
}

export const DisabledMobile = {
  ...Template,
  args: {
    variant: 'mobile',
    state: {
      activeSlide: ActiveSlide.Content,
      activeContent: ActiveContent.Canvas,
      activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.AddBlock,
      selectedStep: null,
      steps: null
    }
  }
}

export default FabDemo
