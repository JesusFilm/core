import { Story, Meta } from '@storybook/react'
import { TreeBlock } from '@core/journeys/ui'
import Stack from '@mui/material/Stack'
import { journeysAdminConfig } from '../../../../../../libs/storybook'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../../../../__generated__/GetJourney'
import { Step } from '.'

const StepStory = {
  ...journeysAdminConfig,
  component: Step,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Step'
}

export const Default: Story = () => {
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
      <Step {...block} />
    </Stack>
  )
}

export const Locked: Story = () => {
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
      <Step {...block} />
    </Stack>
  )
}

export default StepStory as Meta
