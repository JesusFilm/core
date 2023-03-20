import { Story, Meta } from '@storybook/react'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journeysAdminConfig } from '../../../libs/storybook'
import { journey } from '../ActionDetails/data'
import { ActionsTable } from '.'

const ActionsTableStory = {
  ...journeysAdminConfig,
  component: ActionsTable,
  title: 'Journeys-Admin/Editor/ActionsTable'
}

const Template: Story = () => (
  <JourneyProvider value={{ journey }}>
    <ActionsTable />
  </JourneyProvider>
)

export const Default = Template.bind({})

export const Placeholder = Template.bind({})

export default ActionsTableStory as Meta
