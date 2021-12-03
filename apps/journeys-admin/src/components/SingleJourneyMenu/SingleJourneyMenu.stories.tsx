import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../libs/storybook'
import { defaultJourney } from '../JourneyList/journeyListData'
import SingleJourneyMenu, { JOURNEY_STATUS_UPDATE } from './SingleJourneyMenu'
import { JourneyStatus } from '../../../__generated__/globalTypes'

const TestStory = {
  ...journeysAdminConfig,
  component: SingleJourneyMenu,
  title: 'Journeys-Admin/SingleJourney/SingleJourneyMenu'
}

const Template: Story = () => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: JOURNEY_STATUS_UPDATE,
          variables: {
            input: {
              status: JourneyStatus.published
            }
          }
        },
        result: {
          data: {
            journeyUpdate: {
              __typename: 'Journey',
              status: JourneyStatus.published
            }
          }
        }
      }
    ]}
  >
    {/* Make this open after refactoring with Nav bar */}
    <SingleJourneyMenu journey={{ ...defaultJourney }} />
  </MockedProvider>
)

export const StoryComponent = Template.bind({})

export default TestStory as Meta
