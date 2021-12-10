import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../libs/storybook'
import { defaultJourney } from '../../JourneyList/journeyListData'
import Menu, { JOURNEY_PUBLISH } from './Menu'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { MenuProps } from '.'

const TestStory = {
  ...journeysAdminConfig,
  component: Menu,
  title: 'Journeys-Admin/SingleJourney/Menu'
}

const Template: Story<MenuProps> = ({ ...args }) => (
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
    <Menu {...args} />
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
