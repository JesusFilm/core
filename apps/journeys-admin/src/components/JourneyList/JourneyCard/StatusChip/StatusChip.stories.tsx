import Grid from '@mui/material/Grid'
import { Meta, StoryObj } from '@storybook/react'

import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../../libs/storybook'

import { StatusChip } from '.'

const StatusChipDemo: Meta<typeof StatusChip> = {
  ...simpleComponentConfig,
  component: StatusChip,
  title: 'Journeys-Admin/JourneyList/JourneyCard/StatusChip'
}

const Template: StoryObj<typeof StatusChip> = {
  render: ({ ...args }) => (
    <Grid
      container
      spacing={2}
      display="flex"
      alignItems="center"
      sx={{ mt: 0 }}
    >
      <StatusChip {...args} />
    </Grid>
  )
}

export const Draft = {
  ...Template,
  args: {
    status: JourneyStatus.draft
  }
}

export const Published = {
  ...Template,
  args: {
    status: JourneyStatus.published
  }
}

export const Archived = {
  ...Template,
  args: {
    status: JourneyStatus.archived
  }
}

export const Trashed = {
  ...Template,
  args: {
    status: JourneyStatus.trashed
  }
}

export default StatusChipDemo
