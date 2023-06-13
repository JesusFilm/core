import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../../libs/simpleComponentConfig'
import { ChatButtons } from './ChatButtons'

const ChatButtonsDemo = {
  ...simpleComponentConfig,
  component: ChatButtons,
  title: 'Journeys-Ui/StepFooter/ChatButtons'
}

const Template: Story = () => <ChatButtons />

export const Default = Template.bind({})

export default ChatButtonsDemo as Meta
