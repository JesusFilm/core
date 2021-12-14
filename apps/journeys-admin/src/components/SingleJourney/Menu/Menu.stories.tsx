import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../libs/storybook'

import { Menu, JOURNEY_PUBLISH } from './Menu'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { defaultJourney } from '../singleJourneyData'
import { JourneyProvider } from '../Context'

const MenuStory = {
  ...simpleComponentConfig,
  component: Menu,
  title: 'Journeys-Admin/SingleJourney/Menu'
}

const Template: Story = ({ ...args }) => (
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
    <JourneyProvider value={args.journey}>
      <Menu {...args} />
    </JourneyProvider>
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

export default MenuStory as Meta
