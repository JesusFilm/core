import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../../../../../libs/storybook'
import { Action } from '.'

const ActionStory = {
  ...simpleComponentConfig,
  component: Action,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Button/Action'
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <Action />
    </MockedProvider>
  )
}

export default ActionStory as Meta
