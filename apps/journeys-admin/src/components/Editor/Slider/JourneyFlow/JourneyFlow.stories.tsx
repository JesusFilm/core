import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields_StepBlock as StepBlock } from '@core/journeys/ui/block/__generated__/BlockFields'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { transformer } from '@core/journeys/ui/transformer'

import { simpleComponentConfig } from '../../../../libs/storybook'
import { blocks, defaultJourney } from '../../data'

import { JourneyFlow } from './JourneyFlow'

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
      <EditorProvider
        initialState={{
          steps: args.steps
        }}
      >
        <Box sx={{ width: '100vw', height: '100vh' }}>
          <JourneyFlow />
        </Box>
      </EditorProvider>
    )
  }
}

export const Loading = {
  ...Template,
  args: { steps: undefined }
}

export const Default = {
  ...Template,
  args: { steps }
}

export default JourneyFlowStory
