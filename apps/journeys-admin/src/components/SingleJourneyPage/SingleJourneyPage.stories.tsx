import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../libs/storybook'
import SingleJourneyPage from './SingleJourneyPage'
import { defaultJourney } from '../JourneyList/journeyListData'
import { JOURNEY_PUBLISH } from './SingleJourneyMenu'

const SingleJourneyPageDemo = {
  ...journeysAdminConfig,
  component: SingleJourneyPage,
  title: 'Journeys-Admin/SingleJourneyPage',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = () => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: JOURNEY_PUBLISH,
          variables: { id: defaultJourney.id }
        },
        result: {
          data: {
            journeyUpdate: { id: defaultJourney.id, __typename: 'Journey' }
          }
        }
      }
    ]}
  >
    <SingleJourneyPage journey={defaultJourney} />
  </MockedProvider>
)

export const Default = Template.bind({})

export default SingleJourneyPageDemo as Meta
