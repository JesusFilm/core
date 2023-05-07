import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUncheckedRounded'
import AnnouncementIcon from '@mui/icons-material/AnnouncementRounded'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { EventVariant } from '../../utils'
import { GenericEvent } from '.'

const GenericEventStory = {
  ...journeysAdminConfig,
  title:
    'Journeys-Admin/VisitorInfo/VisitorJourneysList/EventsCard/GenericEvent'
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
  showCreatedAt: true,
  variant: EventVariant.start
}

export const Chat = Template.bind({})
Chat.args = {
  activity: 'Chat Open',
  label: 'Facebook',
  value: '2:34pm, Sep 25',
  icon: <AnnouncementIcon />,
  duration: '0.02',
  variant: EventVariant.chat
}

export const Featured = Template.bind({})
Featured.args = {
  activity: 'Button Click',
  label: 'www.google.com',
  value: 'Button Label',
  icon: <RadioButtonUncheckedIcon />,
  duration: '1:02',
  variant: EventVariant.featured
}

export const Title = Template.bind({})
Title.args = {
  value: (
    <Stack direction="row" sx={{ alignItems: 'center' }}>
      <Typography variant="h3" sx={{ pr: 30 }}>
        Journey Title
      </Typography>
      <Typography variant="body2" sx={{ ml: 'auto' }}>
        18 Apri 2023
      </Typography>
    </Stack>
  ),
  duration: '5:10',
  variant: EventVariant.title
}

export default GenericEventStory as Meta
