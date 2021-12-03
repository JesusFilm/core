import { journeysAdminConfig } from '../../../../libs/storybook'
import { Meta, Story } from '@storybook/react'
import SingleJourneyAppBar from './SingleJourneyAppBar'

const SingleJourneyAppBarDemo = {
  ...journeysAdminConfig,
  component: SingleJourneyAppBar,
  title: 'Journeys-Admin/JourneyList/JourneyCard/JourneyCardNavBar'
}

const Template: Story = () => SingleJourneyAppBar()

export const Default = Template.bind({})

export default SingleJourneyAppBarDemo as Meta
