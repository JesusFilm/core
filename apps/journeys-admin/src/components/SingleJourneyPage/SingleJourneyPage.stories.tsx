import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../libs/storybook'
import SingleJourneyPage from './SingleJourneyPage'
import { defaultJourney } from '../JourneyList/journeyListData'
import { JOURNEY_UPDATE } from './SingleJourneyMenu/SingleJourneyMenu'
import { JourneyStatus } from '../../../__generated__/globalTypes'

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
          query: JOURNEY_UPDATE,
          variables: {
            input: {
              id: defaultJourney.id,
              title: 'Journey',
              description: ' Description',
              status: JourneyStatus.published
            }
          }
        },
        result: {
          data: {
            journeyUpdate: {
              id: defaultJourney.id,
              __typename: 'Journey',
              title: 'Journey',
              description: ' Description',
              status: JourneyStatus.published
            }
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
