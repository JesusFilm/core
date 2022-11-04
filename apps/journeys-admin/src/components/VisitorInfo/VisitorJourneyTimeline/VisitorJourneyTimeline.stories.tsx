import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'
import Typography from '@mui/material/Typography'
import { simpleComponentConfig } from '../../../libs/storybook'
import { GetVisitorEvents_visitor_events as Event } from '../../../../__generated__/GetVisitorEvents'
import {
  MessagePlatform,
  VideoBlockSource
} from '../../../../__generated__/globalTypes'
import { VisitorJourneyTimeline } from '.'

const VisitorJourneyTimelineDemo = {
  ...simpleComponentConfig,
  component: VisitorJourneyTimeline,
  title: 'Journeys-Admin/VisitorInfo/VisitorJourneyTimeline'
}

const events: Event[] = [
  {
    __typename: 'ChatOpenEvent',
    id: 'ChatOpenEventId',
    journeyId: 'journeyId',
    label: null,
    value: 'facebook',
    createdAt: '2022-11-02T03:20:26.368Z',
    messagePlatform: MessagePlatform.facebook
  },
  {
    __typename: 'ButtonClickEvent',
    id: 'ButtonClickEventId',
    journeyId: 'journeyId',
    label: 'How will you remember the journey?',
    value: 'Write a book',
    createdAt: '2022-11-02T03:20:26.368Z'
  },
  {
    __typename: 'RadioQuestionSubmissionEvent',
    id: 'RadioQuestionSubmissionEventId',
    journeyId: 'journeyId',
    label: 'How do you feel about your journey?',
    value: '10/10 would do it again',
    createdAt: '2022-11-02T03:20:26.368Z'
  },
  {
    __typename: 'StepViewEvent',
    id: 'StepViewEventId',
    journeyId: 'journeyId',
    label: null,
    value: null,
    createdAt: '2022-11-02T03:20:26.368Z'
  },
  {
    __typename: 'TextResponseSubmissionEvent',
    id: 'TextResponseSubmissionEventId',
    journeyId: 'journeyId',
    label: 'How do you feel about your adventure?',
    value:
      'It was basically the worst. Stabbed, lost, hungry, betrayed, and I lost a finger.',
    createdAt: '2022-11-02T03:20:26.368Z'
  },
  {
    __typename: 'VideoCollapseEvent',
    id: 'VideoCollapseEventId',
    journeyId: 'journeyId',
    label: null,
    value: null,
    createdAt: '2022-11-02T03:20:26.368Z'
  },
  {
    __typename: 'VideoCompleteEvent',
    id: 'VideoCompleteEventId',
    journeyId: 'journeyId',
    label: 'JESUS',
    value: 'youTube',
    createdAt: '2022-11-02T03:20:26.368Z',
    source: VideoBlockSource.youTube
  },
  {
    __typename: 'VideoExpandEvent',
    id: 'VideoExpandEventId',
    journeyId: 'journeyId',
    label: 'JESUS',
    value: 'youTube',
    createdAt: '2022-11-02T03:20:26.368Z'
  },
  {
    __typename: 'VideoPauseEvent',
    id: 'VideoPauseEventId',
    journeyId: 'journeyId',
    label: 'JESUS',
    value: 'youTube',
    createdAt: '2022-11-02T03:20:26.368Z'
  },
  {
    __typename: 'VideoPlayEvent',
    id: 'VideoPlayEventId',
    journeyId: 'journeyId',
    label: 'JESUS',
    value: 'youTube',
    createdAt: '2022-11-02T03:20:26.368Z'
  },
  {
    __typename: 'VideoProgressEvent',
    id: 'VideoProgressEventId',
    journeyId: 'journeyId',
    label: 'JESUS',
    value: 'youTube',
    createdAt: '2022-11-02T03:20:26.368Z'
  },
  {
    __typename: 'VideoStartEvent',
    id: 'VideoStartEventId',
    journeyId: 'journeyId',
    label: 'JESUS',
    value: 'youTube',
    createdAt: '2022-11-02T03:20:26.368Z',
    source: VideoBlockSource.youTube
  },
  {
    __typename: 'SignUpSubmissionEvent',
    id: 'SignUpSubmissionEventId',
    journeyId: 'journeyId',
    label: 'How do you feel at the end of the journey?',
    email: 'bilbo.baggins@example.com',
    value: 'Bilbo Baggins',
    createdAt: '2022-11-02T03:20:26.368Z'
  }
]

const Template: Story<ComponentProps<typeof VisitorJourneyTimeline>> = ({
  ...args
}) => {
  return (
    <>
      <Typography variant="h5" sx={{ pb: 2 }}>
        Default
      </Typography>
      <VisitorJourneyTimeline {...args} />
      <Typography variant="h5" sx={{ pt: 4, pb: 2 }}>
        Compact
      </Typography>
      <VisitorJourneyTimeline {...args} variant="compact" />
    </>
  )
}

export const Default = Template.bind({})
Default.args = {
  events
}

export default VisitorJourneyTimelineDemo as Meta
