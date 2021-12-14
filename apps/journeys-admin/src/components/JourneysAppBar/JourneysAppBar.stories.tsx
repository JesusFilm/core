import { journeysAdminConfig } from '../../libs/storybook'
import { Meta, Story } from '@storybook/react'
import JourneysAppBar, { JourneysAppBarProps } from '.'
import { defaultJourney } from '../JourneyList/journeyListData'

const JourneysAppBarDemo = {
  ...journeysAdminConfig,
  component: JourneysAppBar,
  title: 'Journeys-Admin/JourneysAppBar'
}

const Template: Story<JourneysAppBarProps> = ({ ...args }) => (
  <JourneysAppBar {...args} />
)

export const Default = Template.bind({})

export const SingleJourney = Template.bind({})
SingleJourney.args = { journey: defaultJourney }

export default JourneysAppBarDemo as Meta
