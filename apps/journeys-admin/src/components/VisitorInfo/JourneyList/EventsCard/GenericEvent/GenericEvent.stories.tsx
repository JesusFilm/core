import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUncheckedRounded'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { GenericEvent } from '.'

const GenericEventStory = {
  ...journeysAdminConfig,
  title: 'Journeys-Admin/VisitorInfo/JourneyList/EventsCard/GenericEvent'
}

const Template: Story<ComponentProps<typeof GenericEvent>> = ({ ...args }) => (
  <GenericEvent {...args} />
)

export const Default = Template.bind({})
Default.args = {
  label: 'Default label',
  activity: 'Event action',
  value: 'Some contnet related to event',
  icon: <RadioButtonUncheckedIcon />,
  duration: '0.02'
}

export const Start = Template.bind({})
Start.args = {
  createdAt: '2021-02-18T00:00:00.000Z',
  value: 'Journey Started',
  icon: <RadioButtonUncheckedIcon />,
  position: 'start'
}

export const End = Template.bind({})
End.args = {
  label: 'Default label',
  value: 'Some contnet related to event',
  icon: <RadioButtonUncheckedIcon />,
  position: 'end'
}

export const CustomValue = Template.bind({})
CustomValue.args = {
  label: (
    <Stack direction="row" sx={{ alignItems: 'center' }}>
      <Typography variant="h3" sx={{ pr: 30 }}>
        Journey Title
      </Typography>
      <Typography variant="body2" sx={{ ml: 'auto' }}>
        18 Apri 2023
      </Typography>
    </Stack>
  ),
  duration: '5:10'
}

export default GenericEventStory as Meta
