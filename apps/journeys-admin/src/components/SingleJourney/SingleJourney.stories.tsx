import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../libs/storybook'
import SingleJourney from './SingleJourney'
import { defaultJourney, publishedJourney } from './singleJourneyData'
import { JourneyProvider } from './Context'

const SingleJourneyDemo = {
  ...journeysAdminConfig,
  component: SingleJourney,
  title: 'Journeys-Admin/SingleJourney',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: Story = ({ ...args }) => (
  <MockedProvider>
    <JourneyProvider value={args.journey}>
      <SingleJourney />
    </JourneyProvider>
  </MockedProvider>
)

export const Draft = Template.bind({})
Draft.args = {
  journey: defaultJourney
}

export const Published = Template.bind({})
Published.args = {
  journey: publishedJourney
}

export default SingleJourneyDemo as Meta
