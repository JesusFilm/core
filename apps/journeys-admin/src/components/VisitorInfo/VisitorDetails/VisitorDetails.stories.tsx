import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { GetVisitorForDetails } from '../../../../__generated__/GetVisitorForDetails'

import { GET_VISITOR_FOR_DETAILS } from './VisitorDetails'

import { VisitorDetails } from '.'

const VisitorDetailsStory: Meta<typeof VisitorDetails> = {
  ...journeysAdminConfig,
  component: VisitorDetails,
  title: 'Journeys-Admin/VisitorInfo/VisitorDetails',
  parameters: {
    chromatic: { delay: 3000 }
  }
}

const Template: StoryObj<
  ComponentProps<typeof VisitorDetails> & {
    mocks: [MockedResponse<GetVisitorForDetails>]
  }
> = {
  render: ({ ...args }) => (
    <MockedProvider mocks={args.mocks}>
      <VisitorDetails id="visitor.id" />
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
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
}

export const Complete = {
  ...Template,
  args: {
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
}

export default VisitorDetailsStory
