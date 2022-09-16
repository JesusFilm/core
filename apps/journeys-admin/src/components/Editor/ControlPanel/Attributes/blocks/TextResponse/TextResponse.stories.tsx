import { Story, Meta } from '@storybook/react'
import Stack from '@mui/material/Stack'
import type { TreeBlock } from '@core/journeys/ui/block'
import { journeysAdminConfig } from '../../../../../../libs/storybook'
import { GetJourney_journey_blocks_TextResponseBlock as TextResponseBlock } from '../../../../../../../__generated__/GetJourney'
import { TextResponse } from './TextResponse'

const TextResponseStory = {
  ...journeysAdminConfig,
  component: TextResponse,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/TextResponse'
}

const defaultBlock: TreeBlock<TextResponseBlock> = {
  __typename: 'TextResponseBlock',
  id: 'textResponseBlock.id',
  parentBlockId: null,
  parentOrder: null,
  children: []
}

const Template: Story = ({ ...args }) => {
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
      <TextResponse {...args.block} />
    </Stack>
  )
}

export const Default = Template.bind({})
Default.args = {
  block: defaultBlock
}

export default TextResponseStory as Meta
