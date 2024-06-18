import { StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveFab,
  ActiveSlide,
  EditorProvider,
  EditorState
} from '@core/journeys/ui/EditorProvider'
import { TreeBlock } from '@core/journeys/ui/block'
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
  children: []
}

const Template: StoryObj<ComponentProps<typeof Fab> & { state: EditorState }> =
  {
    render: ({ ...args }) => (
      <EditorProvider initialState={args.state}>
        <Fab {...args} />
      </EditorProvider>
    )
  }

export const SaveDesktop = {
  ...Template,
  args: {
    variant: 'canvas',
    state: {
      activeFab: ActiveFab.Save,
      activeSlide: ActiveSlide.Content,
      activeContent: ActiveContent.Canvas,
      activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.AddBlock,
      selectedStep: defaultStep,
      steps: [defaultStep]
    }
  }
}

export const SaveMobile = {
  ...Template,
  args: {
    variant: 'mobile',
    state: {
      activeFab: ActiveFab.Save,
      activeSlide: ActiveSlide.Content,
      activeContent: ActiveContent.Canvas,
      activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.AddBlock,
      selectedStep: defaultStep,
      steps: [defaultStep]
    }
  }
}

export const AddDesktop = {
  ...Template,
  args: {
    variant: 'canvas',
    state: {
      activeFab: ActiveFab.Add,
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
      activeFab: ActiveFab.Add,
      activeSlide: ActiveSlide.Content,
      activeContent: ActiveContent.Canvas,
      activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.AddBlock,
      selectedStep: defaultStep,
      steps: [defaultStep]
    }
  }
}

export const EditDesktop = {
  ...Template,
  args: {
    variant: 'canvas',
    state: {
      activeFab: ActiveFab.Edit,
      activeSlide: ActiveSlide.Content,
      activeContent: ActiveContent.Canvas,
      activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.AddBlock,
      selectedStep: defaultStep,
      steps: [defaultStep]
    }
  }
}

export const EditMobile = {
  ...Template,
  args: {
    variant: 'mobile',
    state: {
      activeFab: ActiveFab.Edit,
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
      activeFab: ActiveFab.Save,
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
      activeFab: ActiveFab.Save,
      activeSlide: ActiveSlide.Content,
      activeContent: ActiveContent.Canvas,
      activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.AddBlock,
      selectedStep: null,
      steps: null
    }
  }
}

export default FabDemo
