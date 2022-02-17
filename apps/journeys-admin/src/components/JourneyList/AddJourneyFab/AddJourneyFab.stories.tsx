import { Story, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../../libs/storybook'

import { AddJourneyFab } from '.'

const AddJourneyFabStory = {
  ...simpleComponentConfig,
  component: AddJourneyFab,
  title: 'Journeys-Admin/JourneyList/AddJourneyFab'
}

const Template: Story = () => <AddJourneyFab />

export const Default = Template.bind({})

export default AddJourneyFabStory as Meta
