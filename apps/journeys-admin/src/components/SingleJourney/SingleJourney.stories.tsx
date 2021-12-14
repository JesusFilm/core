import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../libs/storybook'
import SingleJourney from './SingleJourney'
import { defaultJourney } from '../JourneyList/journeyListData'
import { JOURNEY_PUBLISH } from './Menu'

const SingleJourneyDemo = {
  ...journeysAdminConfig,
  component: SingleJourney,
  title: 'Journeys-Admin/SingleJourney',
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
    <SingleJourney />
  </MockedProvider>
)

export const Default = Template.bind({})

export default SingleJourneyDemo as Meta
