import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../libs/storybook'

import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { defaultJourney } from '../data'
import { JourneyProvider } from '../../../libs/context'
import { Menu, JOURNEY_PUBLISH } from './Menu'

const MenuStory = {
  ...simpleComponentConfig,
  component: Menu,
  title: 'Journeys-Admin/JourneyView/Menu'
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

export const Loading = Template.bind({})
Loading.args = { journey: undefined }

export default MenuStory as Meta
