import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../libs/storybook'
import { defaultJourney } from '../JourneyList/journeyListData'
import SingleJourneyMenu, { JOURNEY_STATUS_UPDATE } from './SingleJourneyMenu'
import { JourneyStatus } from '../../../__generated__/globalTypes'
import { SingleJourneyMenuProps } from '.'

const TestStory = {
  ...journeysAdminConfig,
  component: SingleJourneyMenu,
  title: 'Journeys-Admin/SingleJourney/SingleJourneyMenu'
}

const Template: Story<SingleJourneyMenuProps> = ({ ...args }) => (
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
    <SingleJourneyMenu {...args} />
  </MockedProvider>
)

export const Draft = Template.bind({})
Draft.args = { journey: defaultJourney }

export const Published = Template.bind({})
Published.args = {
  journey: {
    ...defaultJourney,
    publishedAt: '2021-11-19T12:34:56.647Z',
    status: JourneyStatus.published
  }
}

export default TestStory as Meta
