import { Story, Meta } from '@storybook/react'
import { TreeBlock } from '@core/journeys/ui'
import Stack from '@mui/material/Stack'
import { journeysAdminConfig } from '../../../../../../libs/storybook'
import { GetJourneyForEdit_journey_blocks_TypographyBlock as TypographyBlock } from '../../../../../../../__generated__/GetJourneyForEdit'
import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../../../../../__generated__/globalTypes'
import { Typography } from '.'

const TypographyStory = {
  ...journeysAdminConfig,
  component: Typography,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Typography'
}

export const Default: Story = () => {
  const block: TreeBlock<TypographyBlock> = {
    id: 'typography1.id',
    __typename: 'TypographyBlock',
    parentBlockId: null,
    align: null,
    color: null,
    content: 'Typography',
    variant: null,
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
      <Typography {...block} />
    </Stack>
  )
}
export const Filled: Story = () => {
  const block: TreeBlock<TypographyBlock> = {
    id: 'typography1.id',
    __typename: 'TypographyBlock',
    parentBlockId: null,
    align: TypographyAlign.center,
    color: TypographyColor.error,
    content: 'Typography',
    variant: TypographyVariant.h2,
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
      <Typography {...block} />
    </Stack>
  )
}

export default TypographyStory as Meta
