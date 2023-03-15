import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { simpleComponentConfig } from '../../../libs/storybook'
import { journey } from './data'
import { ActionDetails } from '.'

const ActionDetailsStory = {
  ...simpleComponentConfig,
  component: ActionDetails,
  title: 'Journeys-Admin/Editor/ActionDetails'
}

const Template: Story = () => (
  <MockedProvider>
    <JourneyProvider value={{ journey }}>
      <ActionDetails url="https://www.google.com/" />
    </JourneyProvider>
  </MockedProvider>
)

export const Default = Template.bind({})

export default ActionDetailsStory as Meta
