import { Story, Meta } from '@storybook/react'
import { TreeBlock } from '@core/journeys/ui'
import Stack from '@mui/material/Stack'
import { simpleComponentConfig } from '../../../../../../libs/storybook'
import { GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock } from '../../../../../../../__generated__/GetJourney'
import { RadioOption } from '.'

const RadioOptionStory = {
  ...simpleComponentConfig,
  component: RadioOption,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/RadioOption'
}

export const Default: Story = () => {
  const block: TreeBlock<RadioOptionBlock> = {
    id: 'radio-option.id',
    __typename: 'RadioOptionBlock',
    parentBlockId: 'step1.id',
    parentOrder: 0,
    label: 'Radio Option',
    action: null,
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
      <RadioOption {...block} />
    </Stack>
  )
}

export const Filled: Story = () => {
  const block: TreeBlock<RadioOptionBlock> = {
    id: 'radio-option.id',
    __typename: 'RadioOptionBlock',
    parentBlockId: 'step1.id',
    parentOrder: 0,
    label: 'Radio Option',
    action: {
      __typename: 'NavigateToBlockAction',
      gtmEventName: 'navigateToBlock',
      blockId: 'step2.id'
    },
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
      <RadioOption {...block} />
    </Stack>
  )
}

export default RadioOptionStory as Meta
