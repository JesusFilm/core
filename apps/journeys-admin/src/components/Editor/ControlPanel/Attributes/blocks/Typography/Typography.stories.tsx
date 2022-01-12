import { Story, Meta } from '@storybook/react'
import { TreeBlock } from '@core/journeys/ui'
import { journeysAdminConfig } from '../../../../../../libs/storybook'
import { GetJourneyForEdit_journey_blocks_TypographyBlock as TypographyBlock } from '../../../../../../../__generated__/GetJourneyForEdit'
import { Typography } from '.'

const TypographyStory = {
  ...journeysAdminConfig,
  component: Typography,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Typography'
}

export const Default: Story = () => {
  // const block: TreeBlock<TypographyBlock> = {
  //   id: 'typography1.id',
  //   __typename: 'TypographyBlock',
  //   parentBlockId: null,
  //   align: null,
  //   color: null,
  //   content: 'Typography',
  //   variant: null
  // }

  return <Typography />
}

export default TypographyStory as Meta
