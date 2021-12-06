import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../libs/storybook'
import SingleJourneyPage from './SingleJourneyPage'
import { defaultJourney } from '../JourneyList/journeyListData'

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
  <MockedProvider mocks={[]}>
    <SingleJourneyPage journey={defaultJourney} />
  </MockedProvider>
)

export const Default = Template.bind({})

export default SingleJourneyPageDemo as Meta
