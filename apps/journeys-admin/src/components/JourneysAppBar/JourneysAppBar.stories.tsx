import { journeysAdminConfig } from '../../libs/storybook'
import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import JourneysAppBar, { JourneysAppBarProps } from '.'
import { defaultJourney } from '../SingleJourney/singleJourneyData'

const JourneysAppBarDemo = {
  ...journeysAdminConfig,
  component: JourneysAppBar,
  title: 'Journeys-Admin/JourneysAppBar',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: Story<JourneysAppBarProps> = ({ ...args }) => (
  <MockedProvider mocks={[]}>
    <JourneysAppBar {...args} />
  </MockedProvider>
)

export const Default = Template.bind({})

export const SingleJourney = Template.bind({})
SingleJourney.args = { journey: defaultJourney }

export default JourneysAppBarDemo as Meta
