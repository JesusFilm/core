import { MockedResponse } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields_StepBlock as StepBlock } from '@core/journeys/ui/block/__generated__/BlockFields'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import {
  blocks,
  blocksWithStepBlockPosition,
  defaultJourney
} from '@core/journeys/ui/TemplateView/data'
import { transformer } from '@core/journeys/ui/transformer'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import {
  GetStepBlocksWithPosition,
  GetStepBlocksWithPositionVariables
} from '../../../../../__generated__/GetStepBlocksWithPosition'

import { GET_STEP_BLOCKS_WITH_POSITION, JourneyFlow } from './JourneyFlow'

const JourneyFlowStory: Meta<typeof JourneyFlow> = {
  ...simpleComponentConfig,
  component: JourneyFlow,
  title: 'Journeys-Admin/Editor/Slider/JourneyFlow',
  parameters: {
    ...simpleComponentConfig.parameters,
    layout: 'fullscreen'
  }
}

const journey = { defaultJourney, blocks }

const steps = transformer(journey?.blocks) as Array<TreeBlock<StepBlock>>

const Template: StoryObj<
  ComponentProps<typeof JourneyFlow> & {
    steps: Array<TreeBlock<StepBlock>>
  }
> = {
  render: (args) => {
    return (
      <JourneyProvider value={{ journey: defaultJourney }}>
        <EditorProvider
          initialState={{
            steps: args.steps
          }}
        >
          <Box sx={{ width: '100vw', height: '100vh' }}>
            <JourneyFlow />
          </Box>
        </EditorProvider>
      </JourneyProvider>
    )
  }
}

export const Loading = {
  ...Template,
  args: { steps: undefined },
  parameters: {
    apolloClient: {
      mocks: []
    }
  }
}

const mockGetStepBlocksWithPosition: MockedResponse<
  GetStepBlocksWithPosition,
  GetStepBlocksWithPositionVariables
> = {
  request: {
    query: GET_STEP_BLOCKS_WITH_POSITION,
    variables: {
      journeyIds: [defaultJourney.id]
    }
  },
  result: {
    data: {
      blocks: blocksWithStepBlockPosition
    }
  }
}

export const Default = {
  ...Template,
  args: { steps },
  parameters: {
    apolloClient: {
      mocks: [mockGetStepBlocksWithPosition]
    }
  }
}

export default JourneyFlowStory
