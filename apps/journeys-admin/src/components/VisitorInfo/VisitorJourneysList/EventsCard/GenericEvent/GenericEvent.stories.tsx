import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/nextjs'

import CheckContainedIcon from '@core/shared/ui/icons/CheckContained'
import CircleIcon from '@core/shared/ui/icons/Circle'
import Marker1Icon from '@core/shared/ui/icons/Marker1'
import MessageText1Icon from '@core/shared/ui/icons/MessageText1'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { EventVariant } from '../../utils'

import { GenericEvent } from '.'

const GenericEventStory: Meta<typeof GenericEvent> = {
  ...journeysAdminConfig,
  title:
    'Journeys-Admin/VisitorInfo/VisitorJourneysList/EventsCard/GenericEvent',
  component: GenericEvent
}

const Template: StoryObj<typeof GenericEvent> = {
  render: ({ ...args }) => <GenericEvent {...args} />
}

export const Default = {
  ...Template,
  args: {
    activity: 'Event action:',
    label: 'Default label',
    value: 'Some content related to event',
    icon: <CircleIcon />,
    duration: '0.02'
  }
}

export const Start = {
  ...Template,
  args: {
    createdAt: '2021-02-18T00:00:00.000Z',
    value: 'Journey Started',
    icon: <Marker1Icon />,
    showCreatedAt: true,
    variant: EventVariant.start
  }
}

export const Chat = {
  ...Template,
  args: {
    activity: 'Chat Open:',
    label: 'Facebook',
    value: '2:34pm, Sep 25',
    icon: <MessageText1Icon />,
    duration: '0.02',
    variant: EventVariant.chat
  }
}

export const Featured = {
  ...Template,
  args: {
    activity: 'Button Click:',
    label: 'www.google.com',
    value: 'Button Label',
    icon: <CheckContainedIcon />,
    duration: '1:02',
    variant: EventVariant.featured
  }
}

export const Title = {
  ...Template,
  args: {
    value: (
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}
      >
        <Typography variant="h3" sx={{ pr: 30 }}>
          Journey Title
        </Typography>
        <Typography variant="body2" sx={{ ml: { xs: undefined, sm: 'auto' } }}>
          18 Apri 2023
        </Typography>
      </Stack>
    ),
    duration: '5:10',
    variant: EventVariant.title
  }
}

export default GenericEventStory
