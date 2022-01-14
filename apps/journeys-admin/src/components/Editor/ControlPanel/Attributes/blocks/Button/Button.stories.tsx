import { Story, Meta } from '@storybook/react'
import { TreeBlock } from '@core/journeys/ui'
import { Stack } from '@mui/material'
import { simpleComponentConfig } from '../../../../../../libs/storybook'
import { GetJourneyForEdit_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../__generated__/GetJourneyForEdit'
import { Button } from '.'

const ButtonStory = {
  ...simpleComponentConfig,
  component: Button,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Button'
}

export const Default: Story = () => {
  const block: TreeBlock<ButtonBlock> = {
    id: 'button.id',
    __typename: 'ButtonBlock',
    parentBlockId: 'step1.id',
    label: 'Button',
    buttonVariant: null,
    buttonColor: null,
    size: null,
    startIcon: null,
    endIcon: null,
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
      <Button {...block} />
    </Stack>
  )
}

export default ButtonStory as Meta
