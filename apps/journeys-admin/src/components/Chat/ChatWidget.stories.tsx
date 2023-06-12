import { Story, Meta } from '@storybook/react'
import { ComponentProps } from 'react'
import { journeysAdminConfig } from '../../libs/storybook'
import { ChatWidget } from './Chat'

const ChatWidgetStory = {
  ...journeysAdminConfig,
  component: ChatWidget,
  title: 'Journeys-Admin/ChatWidget'
}

const Template: Story<ComponentProps<typeof ChatWidget>> = () => <ChatWidget />
// const Template: Story<ComponentProps<typeof ChatWidget>> = ({ ...args }) => (
//   <ChatWidget {...args} />
// )

export const Default = Template.bind({})

export default ChatWidgetStory as Meta
