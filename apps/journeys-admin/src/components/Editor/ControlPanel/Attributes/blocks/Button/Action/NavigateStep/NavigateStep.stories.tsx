import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../../../../../../libs/storybook'
import { NavigateStep } from '.'

const NavigateStepStory = {
  ...simpleComponentConfig,
  component: NavigateStep,
  title:
    'Journeys-Admin/Editor/ControlPanel/Attributes/Button/Action/NavigateStep'
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <NavigateStep />
    </MockedProvider>
  )
}

export default NavigateStepStory as Meta
