import { Meta, Story } from '@storybook/react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { ComponentProps, ReactElement } from 'react'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import {
  journeyViewEvent,
  chatOpenedEvent,
  textResponseSubmissionEvent,
  buttonClickEvent,
  radioQuestionSubmissionEvent,
  stepNextEvent,
  stepViewEvent,
  signUpSubmissionEvent,
  videoStartEvent,
  videoPlayEvent,
  videoPauseEvent,
  videoProgressEvent,
  videoExpandEvent,
  videoCompleteEvent
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
    <StoryItem title="JourneyViewEvent" event={journeyViewEvent} />
    <StoryItem title="ChatOpenedEevent" event={chatOpenedEvent} />
    <StoryItem
      title="TextResponseSubmissionEvent"
      event={textResponseSubmissionEvent}
    />
    <StoryItem title="ButtonClickEvent" event={buttonClickEvent} />
    <StoryItem
      title="RadioQuestionSubmissionEvent"
      event={radioQuestionSubmissionEvent}
    />
    <StoryItem title="SignUpSubmissionEvent" event={signUpSubmissionEvent} />

    <StoryItem title="StepNextEvent" event={stepNextEvent} />
    <StoryItem title="StepViewEvent" event={stepViewEvent} />

    <StoryItem title="VideoStartEvent" event={videoStartEvent} />
    <StoryItem title="VideoPlayEvent" event={videoPlayEvent} />
    <StoryItem title="VideoPauseEvent" event={videoPauseEvent} />
    <StoryItem title="VideoProgressEvent" event={videoProgressEvent} />
    <StoryItem title="VideoExpandEvent" event={videoExpandEvent} />
    <StoryItem title="VideoCompleteEvent" event={videoCompleteEvent} />
  </Stack>
)

export const Default = Template.bind({})

export default TimelineEventStory as Meta
