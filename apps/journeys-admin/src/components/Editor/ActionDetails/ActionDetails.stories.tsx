import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { ComponentProps } from 'react'
import { simpleComponentConfig } from '../../../libs/storybook'
import { journey } from './data'
import { ActionDetails } from '.'

const ActionDetailsStory = {
  ...simpleComponentConfig,
  component: ActionDetails,
  title: 'Journeys-Admin/Editor/ActionDetails'
}

const Template: Story<ComponentProps<typeof ActionDetails>> = (args) => (
  <MockedProvider>
    <JourneyProvider value={{ journey }}>
      <ActionDetails {...args} />
    </JourneyProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  url: 'https://www.google.com/'
}

export const Placeholder = Template.bind({})
Placeholder.args = {
  url: null
}

export default ActionDetailsStory as Meta
