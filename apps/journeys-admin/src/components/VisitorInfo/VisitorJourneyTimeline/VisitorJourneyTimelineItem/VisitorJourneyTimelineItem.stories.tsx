import { Meta, Story } from '@storybook/react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { simpleComponentConfig } from '../../../../libs/storybook'
import { GetVisitorEvents_visitor_events as Event } from '../../../../../__generated__/GetVisitorEvents'
import { VisitorJourneyTimelineItem } from '.'

const VisitorJourneyTimelineItemDemo = {
  ...simpleComponentConfig,
  component: VisitorJourneyTimelineItem,
  title:
    'Journeys-Admin/VisitorInfo/VisitorJourneyTimeline/VisitorJourneyTimelineItem'
}

const buttonClickEvent: Event = {
  __typename: 'ButtonClickEvent',
  id: 'ButtonClickEventId',
  journeyId: 'journeyId',
  label: 'How will you remember the journey?',
  value: 'Write a book',
  createdAt: '2022-11-02T03:20:26.368Z'
}
const radioQuestionSubmissionEvent: Event = {
  __typename: 'RadioQuestionSubmissionEvent',
  id: 'RadioQuestionSubmissionEventId',
  journeyId: 'journeyId',
  label: 'How do you feel about your journey?',
  value: '10/10 would do it again',
  createdAt: '2022-11-02T03:20:26.368Z'
}
const textResponseSubmissionEvent: Event = {
  __typename: 'TextResponseSubmissionEvent',
  id: 'TextResponseSubmissionEventId',
  journeyId: 'journeyId',
  label: 'How do you feel about your adventure?',
  value:
    'It was basically the worst. Stabbed, lost, hungry, betrayed, and I lost a finger.',
  createdAt: '2022-11-02T03:20:26.368Z'
}
const videoCompleteEvent: Event = {
  __typename: 'VideoCompleteEvent',
  id: 'VideoCompleteEventId',
  journeyId: 'journeyId',
  label: null,
  value: null,
  createdAt: '2022-11-02T03:20:26.368Z'
}
const videoStartEvent: Event = {
  __typename: 'VideoStartEvent',
  id: 'VideoStartEventId',
  journeyId: 'journeyId',
  label: null,
  value: null,
  createdAt: '2022-11-02T03:20:26.368Z'
}
const signUpSubmissionEvent: Event = {
  __typename: 'SignUpSubmissionEvent',
  id: 'SignUpSubmissionEventId',
  journeyId: 'journeyId',
  label: 'How do you feel at the end of the journey?',
  email: 'bilbo.baggins@example.com',
  value: 'Bilbo Baggins',
  createdAt: '2022-11-02T03:20:26.368Z'
}

const Template: Story = () => {
  return (
    <Stack>
      <Typography variant="h5" sx={{ py: 2 }}>
        ButtonClickEvent
      </Typography>
      <VisitorJourneyTimelineItem event={buttonClickEvent} />
      <VisitorJourneyTimelineItem event={buttonClickEvent} variant="compact" />

      <Typography variant="h5" sx={{ py: 2 }}>
        RadioQuestionSubmissionEvent
      </Typography>
      <VisitorJourneyTimelineItem event={radioQuestionSubmissionEvent} />
      <VisitorJourneyTimelineItem
        event={radioQuestionSubmissionEvent}
        variant="compact"
      />

      <Typography variant="h5" sx={{ py: 2 }}>
        TextResponseSubmissionEvent
      </Typography>
      <VisitorJourneyTimelineItem event={textResponseSubmissionEvent} />
      <VisitorJourneyTimelineItem
        event={textResponseSubmissionEvent}
        variant="compact"
      />

      <Typography variant="h5" sx={{ py: 2 }}>
        VideoCompleteEvent
      </Typography>
      <VisitorJourneyTimelineItem event={videoCompleteEvent} />
      <VisitorJourneyTimelineItem
        event={videoCompleteEvent}
        variant="compact"
      />

      <Typography variant="h5" sx={{ py: 2 }}>
        VideoStartEvent
      </Typography>
      <VisitorJourneyTimelineItem event={videoStartEvent} />
      <VisitorJourneyTimelineItem event={videoStartEvent} variant="compact" />

      <Typography variant="h5" sx={{ py: 2 }}>
        SignUpSubmissionEvent
      </Typography>
      <VisitorJourneyTimelineItem event={signUpSubmissionEvent} />
      <VisitorJourneyTimelineItem
        event={signUpSubmissionEvent}
        variant="compact"
      />
    </Stack>
  )
}

export const Default = Template.bind({})

export default VisitorJourneyTimelineItemDemo as Meta
