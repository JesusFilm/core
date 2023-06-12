import { Story, Meta } from '@storybook/react'
import { ComponentProps } from 'react'
import { journeysAdminConfig } from '../../libs/storybook'
import { Chat } from './Chat'

const ChatStory = {
  ...journeysAdminConfig,
  component: Chat,
  title: 'Journeys-Admin/Chat'
}

const Template: Story<ComponentProps<typeof Chat>> = () => <Chat />

export const Default = Template.bind({})

export default ChatStory as Meta
