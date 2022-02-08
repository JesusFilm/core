import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../../../../../../libs/storybook'
import { NavigateJourney } from '.'

const NavigateJourneyStory = {
  ...simpleComponentConfig,
  component: NavigateJourney,
  title:
    'Journeys-Admin/Editor/ControlPanel/Attributes/Button/Action/NavigateJourney'
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <NavigateJourney />
    </MockedProvider>
  )
}

export default NavigateJourneyStory as Meta
