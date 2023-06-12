import { Story, Meta } from '@storybook/react'
import { ComponentProps } from 'react'
import { journeysAdminConfig } from '../../libs/storybook'
import { Chat } from './Chat'

const ChatWidgetStory = {
  ...journeysAdminConfig,
  component: Chat,
  title: 'Journeys-Admin/Chat'
}

const Template: Story<ComponentProps<typeof Chat>> = () => <Chat />
// const Template: Story<ComponentProps<typeof Chat>> = ({ ...args }) => (
//   <Chat {...args} />
// )

export const Default = Template.bind({})

export default ChatWidgetStory as Meta
