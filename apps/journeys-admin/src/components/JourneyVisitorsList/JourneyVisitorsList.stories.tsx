import { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { VisitorStatus } from '../../../__generated__/globalTypes'

import { JourneyVisitorsList } from '.'
import '../../../test/i18n'

const JourneyVisitorsListStory: Meta<typeof JourneyVisitorsList> = {
  ...journeysAdminConfig,
  title: 'Journeys-Admin/JourneyVisitorsList',
  component: JourneyVisitorsList
}

const Template: StoryObj<typeof JourneyVisitorsList> = {
  render: ({ ...args }) => <JourneyVisitorsList {...args} />
}

export const Default = {
  ...Template,
  args: {
    visitorEdges: [
      {
        __typename: 'JourneyVisitorEdge',
        cursor: 'cursor1',
        node: {
          __typename: 'JourneyVisitor',
          visitorId: '36f0af56-2aa0-4477-8b79-f8303182c69b',
          createdAt: '2021-11-19T12:35:56.647Z',
          duration: 300,
          visitor: {
            __typename: 'Visitor',
            name: 'Ben',
            countryCode: 'Dnipro, Ukraine',
            status: VisitorStatus.checkMarkSymbol,
            referrer: 'Facebook'
          },
          events: [
            {
              __typename: 'ChatOpenEvent',
              id: 'chat1.id',
              label: 'Chat Started',
              value: 'Chat value',
              createdAt: '2021-11-19T12:35:56.647Z'
            },
            {
              __typename: 'RadioQuestionSubmissionEvent',
              id: 'poll1.id',
              label: 'Do you think Jesus loves you?',
              value: 'Yes, Im sure of it!'
            },
            {
              __typename: 'TextResponseSubmissionEvent',
              id: 'text1.id',
              label:
                'If you have any question. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus finibus metus ante, sed venenatis sapien facilisis quis.',
              value:
                'Sometimes its hard to hear God, but we know that God delights in the prayers of the faithful, and He promises to give us what we need.'
            }
          ]
        }
      },
      {
        __typename: 'JourneyVisitorEdge',
        cursor: 'cursor2',
        node: {
          __typename: 'JourneyVisitor',
          visitorId: '416960f7-b037-481e-80e3-3e4d9897970a',
          createdAt: '2021-11-19T12:35:56.647Z',
          duration: 3,
          visitor: {
            __typename: 'Visitor',
            countryCode: 'Dnipro, Ukraine',
            name: null,
            status: null,
            referrer: 'Youtube'
          },
          events: []
        }
      },
      {
        __typename: 'JourneyVisitorEdge',
        cursor: 'cursor3',
        node: {
          __typename: 'JourneyVisitor',
          visitorId: '0c874c32-ac87-4480-b0fb-23ef3d61babe',
          createdAt: '2021-11-19T12:35:56.647Z',
          duration: 300,
          visitor: {
            __typename: 'Visitor',
            name: 'John',
            countryCode: 'Halifax, Canada',
            status: VisitorStatus.warning,
            referrer: 'Facebook'
          },
          events: [
            {
              __typename: 'RadioQuestionSubmissionEvent',
              id: 'poll2.id',
              label: 'Do you think Jesus loves you?',
              value: 'Yes, Im sure of it!'
            }
          ]
        }
      },
      {
        __typename: 'JourneyVisitorEdge',
        cursor: 'cursor4',
        node: {
          __typename: 'JourneyVisitor',
          visitorId: '0357598b-597d-4419-8c7c-d94854f8a95b',
          createdAt: '2021-11-19T12:35:56.647Z',
          duration: null,
          visitor: {
            __typename: 'Visitor',
            countryCode: 'Auckland, New Zealand',
            name: null,
            status: null,
            referrer: 'WhatsApp'
          },
          events: []
        }
      }
    ],
    visitorsCount: 1234,
    fetchNext: noop,
    loading: false,
    hasNextPage: true
  }
}

export const Empty = {
  ...Template,
  args: {
    fetchNext: noop,
    loading: false
  }
}

export const Loading = {
  ...Template,
  args: {
    fetchNext: noop,
    loading: true
  }
}

export default JourneyVisitorsListStory
