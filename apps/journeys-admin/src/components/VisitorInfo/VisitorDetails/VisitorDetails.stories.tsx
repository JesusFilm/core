import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'

import { journeysAdminConfig } from '../../../libs/storybook'

import { GET_VISITOR_FOR_DETAILS } from './VisitorDetails'

import { VisitorDetails } from '.'

const VisitorDetailsStory = {
  ...journeysAdminConfig,
  title: 'Journeys-Admin/VisitorInfo/VisitorDetails'
}

const Template: Story = ({ ...args }) => (
  <MockedProvider mocks={args.mocks}>
    <VisitorDetails id="visitor.id" />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  mocks: [
    {
      request: {
        query: GET_VISITOR_FOR_DETAILS,
        variables: {
          id: 'visitor.id'
        }
      },
      result: {
        data: {
          visitor: {
            __typename: 'Visitor',
            id: 'visitor.id',
            lastChatStartedAt: null,
            countryCode: null,
            userAgent: null
          }
        }
      }
    }
  ]
}

export const Complete = Template.bind({})
Complete.args = {
  mocks: [
    {
      request: {
        query: GET_VISITOR_FOR_DETAILS,
        variables: {
          id: 'visitor.id'
        }
      },
      result: {
        data: {
          visitor: {
            __typename: 'Visitor',
            id: 'visitor.id',
            lastChatStartedAt: '2023-05-05T02:01:04.825Z',
            countryCode: 'New Zealand',
            userAgent: {
              os: {
                name: 'Android'
              }
            }
          }
        }
      }
    }
  ]
}

export default VisitorDetailsStory as Meta
