import { Story, Meta } from '@storybook/react'
import Grid from '@mui/material/Grid'
import { simpleComponentConfig } from '../../../../libs/storybook'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { StatusChipProps } from './StatusChip'
import { StatusChip } from '.'

const StatusChipDemo = {
  ...simpleComponentConfig,
  component: StatusChip,
  title: 'Journeys-Admin/JourneyList/JourneyCard/StatusChip'
}

const Template: Story<StatusChipProps> = ({ ...args }) => (
  <Grid container spacing={2} display="flex" alignItems="center" sx={{ mt: 0 }}>
    <StatusChip {...args} />
  </Grid>
)

export const Draft = Template.bind({})
Draft.args = {
  status: JourneyStatus.draft
}

export const Published = Template.bind({})
Published.args = {
  status: JourneyStatus.published
}

export const Archived = Template.bind({})
Archived.args = {
  status: JourneyStatus.archived
}

export const Trashed = Template.bind({})
Trashed.args = {
  status: JourneyStatus.trashed
}

export default StatusChipDemo as Meta
