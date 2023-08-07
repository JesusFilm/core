import Stack from '@mui/material/Stack'
import { Meta, Story } from '@storybook/react'

import type { TreeBlock } from '@core/journeys/ui/block'

import { GetJourney_journey_blocks_TypographyBlock as TypographyBlock } from '../../../../../../../__generated__/GetJourney'
import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../../../../libs/storybook'

import { Typography } from '.'

const TypographyStory = {
  ...simpleComponentConfig,
  component: Typography,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Typography'
}

export const Default: Story = () => {
  const block: TreeBlock<TypographyBlock> = {
    id: 'typography1.id',
    __typename: 'TypographyBlock',
    parentBlockId: null,
    parentOrder: 0,
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
    parentOrder: 0,
    align: TypographyAlign.left,
    color: TypographyColor.secondary,
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
