import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ReactElement } from 'react'
import '../../../../../../test/i18n'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { TimelineItem } from '../../utils'
import {
  buttonClickLinkEvent,
  buttonClickNavigateToBlockEvent,
  chatOpenedEvent,
  journeyViewEvent,
  radioQuestionSubmissionEvent,
  signUpSubmissionEvent,
  stepNextEvent,
  stepViewEvent,
  textResponseSubmissionEvent,
  videoCompleteEvent,
  videoExpandEvent,
  videoPauseEvent,
  videoPlayEvent,
  videoProgressEvent,
  videoStartEvent
} from '../../utils/data'

import { TimelineEvent } from '.'

const TimelineEventStory: Meta<typeof TimelineEvent> = {
  ...journeysAdminConfig,
  title:
    'Journeys-Admin/VisitorInfo/VisitorJourneysList/EventsCard/TimelineEvent',
  component: TimelineEvent
}

interface StoryItemProps {
  title?: string
  event: TimelineItem
}

function StoryItem({ title, event }: StoryItemProps): ReactElement {
  return (
    <>
      {title != null && (
        <Typography variant="h5" sx={{ py: 2 }}>
          {title}
        </Typography>
      )}
      <TimelineEvent timelineItem={event} />
      <Box sx={{ pb: 6 }} />
    </>
  )
}

const Template: StoryObj<typeof TimelineEvent> = {
  render: () => (
    <Stack>
      <StoryItem title="JourneyViewEvent" event={journeyViewEvent} />
      <StoryItem title="ChatOpenedEevent" event={chatOpenedEvent} />
      <StoryItem
        title="TextResponseSubmissionEvent"
        event={textResponseSubmissionEvent}
      />
      <StoryItem event={buttonClickNavigateToBlockEvent} />
      <StoryItem event={buttonClickLinkEvent} />
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
}

export const Default = { ...Template }

export default TimelineEventStory
