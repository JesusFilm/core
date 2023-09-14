import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '../../libs/storybook'

import { USER_JOURNEY_REQUEST } from './JourneyInvite'

import { JourneyInvite } from '.'

const Demo: Meta<typeof JourneyInvite> = {
  ...journeysAdminConfig,
  component: JourneyInvite,
  title: 'Journeys-Admin/JourneyInvite'
}

const Template: StoryObj<typeof JourneyInvite> = {
  render: ({ ...args }) => {
    return (
      <MockedProvider
        mocks={[
          {
            request: {
              query: USER_JOURNEY_REQUEST,
              variables: {
                journeyId: 'journeyId'
              }
            },
            result: {
              data: {
                userJourneyRequest: {
                  __typename: 'UserJourney',
                  id: 'userJourneyId'
                }
              }
            }
          }
        ]}
      >
        <JourneyInvite {...args} />
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    journeyId: 'journeyId'
  }
}

export default Demo
