import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import { journeysAdminConfig } from '../../libs/storybook'
import { JourneysAppBar, JourneysAppBarProps } from '.'

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

const Default = Template.bind({})

const SingleJourney = Template.bind({})
SingleJourney.args = { variant: 'view' }

export default JourneysAppBarDemo as Meta
export { Default, SingleJourney }
