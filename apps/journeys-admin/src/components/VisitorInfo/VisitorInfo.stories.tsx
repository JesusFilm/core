import { Meta, Story } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { ComponentProps } from 'react'
import { GetVisitorEvents } from '../../../__generated__/GetVisitorEvents'
import { simpleComponentConfig } from '../../libs/storybook'
import { GetVisitor } from '../../../__generated__/GetVisitor'
import { VisitorStatus } from '../../../__generated__/globalTypes'
import { GET_VISITOR_EVENTS } from './VisitorJourneyList/VisitorJourneyList'
import { GET_VISITOR } from './VisitorDetail/VisitorDetailForm/VisitorDetailForm'
import { VisitorInfo } from '.'

const VisitorInfoDemo = {
  ...simpleComponentConfig,
  component: VisitorInfo,
  title: 'Journeys-Admin/VisitorInfo'
}

const getVisitor: GetVisitor = {
  visitor: {
    __typename: 'Visitor',
    id: 'visitorId',
    countryCode: 'NZ',
    lastChatStartedAt: '2022-11-02T03:20:26.368Z',
    messengerId: '0800123456',
    messengerNetwork: 'WhatsApp',
    name: 'Bob Jones',
    notes: 'Is interested in meeting',
    status: VisitorStatus.partyPopper
  }
}

const getVisitorEvents: GetVisitorEvents = {
  visitor: {
    __typename: 'Visitor',
    id: 'visitorId',
    events: [
      {
        __typename: 'TextResponseSubmissionEvent',
        id: 'eventId5',
        journeyId: 'journeyId1',
        label: 'How do you feel at the end of the journey?',
        value:
          "Don't adventures ever have an end? I suppose not. Someone else always has to carry on the story",
        createdAt: '2022-11-02T03:20:26.368Z'
      },
      {
        __typename: 'RadioQuestionSubmissionEvent',
        id: 'eventId4',
        journeyId: 'journeyId1',
        label: 'How do you feel about your journey?',
        value: '10/10 would do it again',
        createdAt: '2022-11-02T03:20:26.368Z'
      },
      {
        __typename: 'JourneyViewEvent',
        id: 'eventId3',
        journeyId: 'journeyId1',
        label: 'A Journey: There and Back Again',
        value: '19',
        language: {
          id: 'languageId',
          __typename: 'Language',
          name: [
            {
              value: 'Hobbitish',
              __typename: 'Translation'
            }
          ]
        },
        createdAt: '2022-11-02T03:20:26.368Z'
      },
      {
        __typename: 'TextResponseSubmissionEvent',
        id: 'eventId2',
        journeyId: 'journeyId0',
        label: 'How do you feel about your adventure?',
        value:
          'It was basically the worst. Stabbed, lost, hungry, betrayed, and I lost a finger.',
        createdAt: '2022-11-02T03:20:26.368Z'
      },
      {
        __typename: 'RadioQuestionSubmissionEvent',
        id: 'eventId1',
        journeyId: 'journeyId0',
        label: 'How do you feel about Sam?',
        value: 'Best friend ever!',
        createdAt: '2022-11-02T03:20:26.368Z'
      },
      {
        __typename: 'JourneyViewEvent',
        id: 'eventId0',
        journeyId: 'journeyId0',
        label: 'Lord of the Rings',
        value: '19',
        createdAt: '2022-11-02T03:20:26.368Z',
        language: {
          id: 'languageId',
          __typename: 'Language',
          name: [
            {
              value: 'Hobbitish',
              __typename: 'Translation'
            }
          ]
        }
      }
    ]
  }
}

const Template: Story<ComponentProps<typeof VisitorInfo>> = ({ ...args }) => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: GET_VISITOR,
          variables: {
            id: 'visitorId'
          }
        },
        result: {
          data: getVisitor
        }
      },
      {
        request: {
          query: GET_VISITOR_EVENTS,
          variables: {
            id: 'visitorId'
          }
        },
        result: {
          data: getVisitorEvents
        }
      }
    ]}
  >
    <VisitorInfo {...args} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  id: 'visitorId'
}

export default VisitorInfoDemo as Meta
