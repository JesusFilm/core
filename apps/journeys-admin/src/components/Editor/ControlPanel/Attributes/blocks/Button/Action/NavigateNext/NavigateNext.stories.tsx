import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../../../../../../libs/storybook'
import { NavigateNext } from '.'

const NavigateNextStory = {
  ...simpleComponentConfig,
  component: NavigateNext,
  title:
    'Journeys-Admin/Editor/ControlPanel/Attributes/Button/Action/NavigateNext'
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <NavigateNext />
    </MockedProvider>
  )
}

export default NavigateNextStory as Meta
