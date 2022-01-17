import { TreeBlock } from '@core/journeys/ui'
import { Story, Meta } from '@storybook/react'
import { Stack } from '@mui/material'
import { GetJourneyForEdit_journey_blocks_RadioQuestionBlock as RadioQuestionBlock } from '../../../../../../../__generated__/GetJourneyForEdit'
import { simpleComponentConfig } from '../../../../../../libs/storybook'
import { RadioQuestion } from '.'

const RadioQuestionStory = {
  ...simpleComponentConfig,
  component: RadioQuestion,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes//RadioQuestion'
}

export const Default: Story = () => {
  const block: TreeBlock<RadioQuestionBlock> = {
    id: 'radio-question.id',
    __typename: 'RadioQuestionBlock',
    parentBlockId: 'step1.id',
    label: 'Radio Question',
    description: null,
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
      <RadioQuestion {...block} />
    </Stack>
  )
}
export const Filled: Story = () => {
  const block: TreeBlock<RadioQuestionBlock> = {
    id: 'radio-question.id',
    __typename: 'RadioQuestionBlock',
    parentBlockId: 'step2.id',
    label: 'Radio Question',
    description: 'Radio Question Description',
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
      <RadioQuestion {...block} />
    </Stack>
  )
}

export default RadioQuestionStory as Meta
