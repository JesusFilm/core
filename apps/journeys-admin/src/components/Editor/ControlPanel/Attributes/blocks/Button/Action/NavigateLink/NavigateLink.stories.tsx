import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../../../../../../libs/storybook'
import { NavigateLink } from '.'

const NavigateLinkStory = {
  ...simpleComponentConfig,
  component: NavigateLink,
  title:
    'Journeys-Admin/Editor/ControlPanel/Attributes/Button/Action/NavigateLink'
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <NavigateLink />
    </MockedProvider>
  )
}

export default NavigateLinkStory as Meta
