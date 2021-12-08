import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../libs/storybook'
import { defaultJourney } from '../../JourneyList/journeyListData'
import SingleJourneyMenu, { JOURNEY_PUBLISH } from './SingleJourneyMenu'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { SingleJourneyMenuProps } from '.'

const TestStory = {
  ...journeysAdminConfig,
  component: SingleJourneyMenu,
  title: 'Journeys-Admin/SingleJourneyPage/SingleJourneyMenu'
}

const Template: Story<SingleJourneyMenuProps> = ({ ...args }) => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: JOURNEY_PUBLISH,
          variables: { id: defaultJourney.id }
        },
        result: {
          data: {
            journeyPublish: { id: defaultJourney.id, __typename: 'Journey' }
          }
        }
      }
    ]}
  >
    <SingleJourneyMenu {...args} />
  </MockedProvider>
)

export const Draft = Template.bind({})
Draft.args = { journey: defaultJourney, forceOpen: true }

export const Published = Template.bind({})
Published.args = {
  journey: {
    ...defaultJourney,
    publishedAt: '2021-11-19T12:34:56.647Z',
    status: JourneyStatus.published
  },
  forceOpen: true
}

export default TestStory as Meta
