import { Meta, Story } from '@storybook/react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { ComponentProps, ReactElement } from 'react'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import {
  buttonClickEvent,
  chatOpenedEvent,
  radioQuestionSubmissionEvent,
  textResponseSubmissionEvent,
  videoCompleteEvent,
  videoStartEvent,
  signUpSubmissionEvent,
  journeyViewEvent
} from '../../utils/data'
import { TimelineItem } from '../../utils'
import { TimelineEvent } from '.'

const TimelineEventStory = {
  ...journeysAdminConfig,
  title:
    'Journeys-Admin/VisitorInfo/VisitorJourneysList/EventsCard/TimelineEvent'
}

interface Props {
  title: string
  event: TimelineItem
}

function StoryItem({ title, event }: Props): ReactElement {
  return (
    <>
      <Typography variant="h5" sx={{ py: 2 }}>
        {title}
      </Typography>
      <TimelineEvent timelineItem={event} />
      <Box sx={{ pb: 6 }} />
    </>
  )
}

const Template: Story<ComponentProps<typeof TimelineEvent>> = () => (
  <Stack>
    <StoryItem title="ButtonClickEvent" event={buttonClickEvent} />
    <StoryItem title="ChatOpenedEevent" event={chatOpenedEvent} />
    <StoryItem
      title="RadioQuestionSubmissionEvent"
      event={radioQuestionSubmissionEvent}
    />
    <StoryItem
      title="TextResponseSubmissionEvent"
      event={textResponseSubmissionEvent}
    />
    <StoryItem title="VideoCompleteEvent" event={videoCompleteEvent} />
    <StoryItem title="VideoStartEvent" event={videoStartEvent} />
    <StoryItem title="SignUpSubmissionEvent" event={signUpSubmissionEvent} />
    <StoryItem title="JourneyViewEvent" event={journeyViewEvent} />
  </Stack>
)

export const Default = Template.bind({})

export default TimelineEventStory as Meta
