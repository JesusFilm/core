import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../libs/storybook'
import { defaultJourney } from '../../JourneyList/journeyListData'
import SingleJourneyMenu, { JOURNEY_UPDATE } from './SingleJourneyMenu'
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
