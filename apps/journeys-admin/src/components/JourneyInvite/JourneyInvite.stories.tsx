import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'

import { journeysAdminConfig } from '../../libs/storybook'

import { JourneyInviteProps, USER_JOURNEY_REQUEST } from './JourneyInvite'

import { JourneyInvite } from '.'

const Demo = {
  ...journeysAdminConfig,
  component: JourneyInvite,
  title: 'Journeys-Admin/JourneyInvite'
}

const Template: Story<JourneyInviteProps> = ({ ...args }) => {
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

export const Default = Template.bind({})
Default.args = {
  journeyId: 'journeyId'
}

export default Demo as Meta
