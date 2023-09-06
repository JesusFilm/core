import Stack from '@mui/material/Stack'
import { Meta, StoryObj } from '@storybook/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../../../../__generated__/GetJourney'
import { journeysAdminConfig } from '../../../../../../libs/storybook'

import { Step } from '.'

const StepStory: Meta<typeof Step> = {
  ...journeysAdminConfig,
  component: Step,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Step'
}

export const Default: StoryObj<typeof Step> = {
  render: () => {
    const block: TreeBlock<StepBlock> = {
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      nextBlockId: null,
      parentOrder: 0,
      locked: false,
      children: []
    }

    return (
      <Stack
        direction="row"
        spacing={4}
        sx={{
          overflowX: 'auto',
          py: 5,
          px: 6
        }}
      >
        <EditorProvider initialState={{ steps: [block] }}>
          <Step {...block} />
        </EditorProvider>
      </Stack>
    )
  }
}

export const Locked: StoryObj<typeof Step> = {
  render: () => {
    const block: TreeBlock<StepBlock> = {
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      nextBlockId: null,
      parentOrder: 0,
      locked: true,
      children: []
    }

    return (
      <Stack
        direction="row"
        spacing={4}
        sx={{
          overflowX: 'auto',
          py: 5,
          px: 6
        }}
      >
        <EditorProvider initialState={{ steps: [block] }}>
          <Step {...block} />
        </EditorProvider>
      </Stack>
    )
  }
}

export default StepStory
