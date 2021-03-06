import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../libs/storybook'
import { USER_JOURNEY_REQUEST, JourneyInviteProps } from './JourneyInvite'
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

export const Sent = Template.bind({})
Sent.args = {
  journeyId: 'journeyId',
  requestReceived: true
}

export default Demo as Meta
